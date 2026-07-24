// scalemates-search — busca datos de un kit en scalemates.com vía Firecrawl.
// Requiere usuario autenticado, aplica rate-limit por usuario y cachea en la tabla `kits`
// (lee por barcode antes de gastar Firecrawl y guarda los resultados nuevos).
import { createClient } from 'npm:@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RATE_MAX = 30; // búsquedas por usuario
const RATE_WINDOW_SECONDS = 3600; // por hora

interface ScalematesKit {
  name: string;
  brand: string;
  scale: string;
  category: string;
  reference: string;
  barcode?: string;
  image_url?: string;
  scalemates_url?: string;
  year?: number;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Mapea una fila de la tabla kits a la forma ScalematesKit
function rowToKit(row: Record<string, any>): ScalematesKit {
  return {
    name: row.name,
    brand: row.brand,
    scale: row.scale,
    category: row.category,
    reference: row.reference ?? '',
    barcode: row.barcode ?? undefined,
    image_url: row.image_url ?? undefined,
    scalemates_url: row.scalemates_url ?? undefined,
    year: row.year ?? undefined,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Autenticación ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ success: false, error: 'No autorizado' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } },
    );
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return json({ success: false, error: 'No autorizado' }, 401);

    const { query, barcode } = await req.json();
    const searchTerm = barcode || query;
    if (!searchTerm) {
      return json({ success: false, error: 'Query or barcode is required' }, 400);
    }

    // --- CACHÉ: buscar por barcode en la tabla kits antes de gastar Firecrawl ---
    if (barcode) {
      const { data: cached } = await supabase
        .from('kits')
        .select('*')
        .eq('barcode', barcode)
        .limit(5);
      if (cached && cached.length > 0) {
        return json({ success: true, data: cached.map(rowToKit), cached: true });
      }
    }

    // --- Rate limit (después de la caché, antes de gastar Firecrawl) ---
    const { data: allowed, error: rlError } = await supabase.rpc('check_and_increment_rate_limit', {
      p_fn: 'scalemates-search',
      p_max: RATE_MAX,
      p_window_seconds: RATE_WINDOW_SECONDS,
    });
    if (!rlError && allowed === false) {
      return json({ success: false, error: 'Has alcanzado el límite de búsquedas por hora. Inténtalo más tarde.' }, 429);
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return json({ success: false, error: 'Firecrawl not configured' }, 500);
    }

    console.log('Searching Scalemates for:', searchTerm);

    // Paso 1: buscar en Scalemates vía Firecrawl web search
    const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `site:scalemates.com ${searchTerm} scale model kit`,
        limit: 5,
        scrapeOptions: {
          formats: ['markdown'],
          onlyMainContent: true,
        },
      }),
    });

    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      console.error('Firecrawl search error:', searchData);
      return json({ success: false, error: 'Search failed' }, 500);
    }

    const results: ScalematesKit[] = [];

    // Paso 2: parsear resultados de búsqueda
    if (searchData.data && Array.isArray(searchData.data)) {
      for (const result of searchData.data) {
        const kit = parseScalematesResult(result, barcode);
        if (kit) {
          results.push(kit);
        }
      }
    }

    // Paso 3: si la búsqueda por barcode no dio resultados, scrapear la página de búsqueda directamente
    if (barcode && results.length === 0) {
      console.log('Trying direct Scalemates search for barcode:', barcode);
      const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: `https://www.scalemates.com/search.php?q=${encodeURIComponent(barcode)}`,
          formats: ['markdown', 'links'],
          onlyMainContent: true,
          waitFor: 2000,
        }),
      });

      const scrapeData = await scrapeResponse.json();

      if (scrapeResponse.ok && scrapeData.data) {
        const parsed = parseScalematesPageContent(scrapeData.data, barcode);
        results.push(...parsed);
      }
    }

    console.log(`Found ${results.length} results`);

    // --- CACHÉ: guardar resultados nuevos en kits (dedupe por scalemates_url) ---
    for (const kit of results) {
      if (!kit.scalemates_url) continue;
      const { data: exists } = await supabase
        .from('kits')
        .select('id')
        .eq('scalemates_url', kit.scalemates_url)
        .limit(1);
      if (!exists || exists.length === 0) {
        await supabase.from('kits').insert({
          name: kit.name,
          brand: kit.brand,
          scale: kit.scale,
          category: kit.category,
          reference: kit.reference || null,
          barcode: kit.barcode || null,
          image_url: kit.image_url || null,
          scalemates_url: kit.scalemates_url || null,
          year: kit.year ?? null,
        });
      }
    }

    return json({ success: true, data: results });
  } catch (error) {
    console.error('Error:', error);
    return json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

function parseScalematesResult(result: any, barcode?: string): ScalematesKit | null {
  try {
    const url = result.url || '';
    const title = result.title || '';
    const markdown = result.markdown || '';

    if (!url.includes('scalemates.com')) return null;

    let name = '';
    let brand = '';
    let scale = '';
    let reference = '';
    let category = 'Other';
    let year: number | undefined;
    let image_url: string | undefined;

    // Extraer escala (1/XX o 1:XX)
    const scaleMatch = (title + ' ' + markdown).match(/Scale[:\s]*1[:/](\d+)/i)
      || (title + ' ' + markdown).match(/1[:/](\d+)/);
    if (scaleMatch) {
      scale = scaleMatch[0].includes('Scale')
        ? '1/' + scaleMatch[1]
        : scaleMatch[0].replace(':', '/');
    }

    const numberMatch = markdown.match(/Number[:\s]*([A-Za-z0-9\-\.]+?)(?=Scale|Type|Released|Barcode|\s|$)/i);
    if (numberMatch) reference = numberMatch[1].trim();

    const releasedMatch = markdown.match(/Released[:\s]*(\d{4})/i);
    if (releasedMatch) year = parseInt(releasedMatch[1]);

    const barcodeMatch = markdown.match(/Barcode[:\s]*(\d+)/i);

    const brandLinkMatch = markdown.match(/\[([A-Za-z][A-Za-z\s&\-\.]+)\]\(https:\/\/www\.scalemates\.com\/brands\//);
    if (brandLinkMatch) {
      brand = brandLinkMatch[1].trim();
    }

    const titleFieldMatch = markdown.match(/Title[:\s]*([^\n]+)/i);
    if (titleFieldMatch) {
      name = titleFieldMatch[1]
        .replace(/Scale[:\s]*1[:/]\d+/gi, '')
        .replace(/Number[:\s]*\S+/gi, '')
        .replace(/Released[:\s]*\d{4}/gi, '')
        .replace(/Type[:\s]*[A-Za-z\s]+(?:kit|model)/gi, '')
        .replace(/Barcode[:\s]*\d+/gi, '')
        .replace(/Packaging[:\s]*[^\n]*/gi, '')
        .replace(/New\s*(tool|parts)/gi, '')
        .replace(/Topic[:\s]*\[[^\]]*\]/gi, '')
        .replace(/\[»[^\]]*\]/gi, '')
        .replace(/\[[^\]]*\]\([^)]*\)/g, '')
        .replace(/\([^)]*\)/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
    }

    if (!name) {
      const titleClean = title.replace(/\s*[|·–-]\s*Scalemates.*$/i, '').trim();
      const parts = titleClean.split(/,\s*/);
      if (parts.length >= 2) {
        name = parts[0].trim();
        if (!brand) brand = parts[1].trim();
        for (const part of parts) {
          const refPart = part.match(/No\.\s*([A-Za-z0-9\-\.]+)/i);
          if (refPart && !reference) reference = refPart[1];
        }
      } else {
        name = titleClean;
      }
    }

    const imgMatch = markdown.match(/!\[[^\]]*\]\(([^)]+scalemates[^)]*\.(jpg|jpeg|png|webp)[^)]*)\)/i);
    if (imgMatch) image_url = imgMatch[1];

    const catText = (markdown + ' ' + title).toLowerCase();
    if (/\b(aircraft|airplane|avion|propeller|jet)\b/.test(catText)) category = 'Aircraft';
    else if (/\b(armor|tank|vehicle|afv|panzer)\b/.test(catText)) category = 'Armor';
    else if (/\b(ship|naval|boat|destroyer|carrier)\b/.test(catText)) category = 'Ships';
    else if (/\b(car|auto|truck|formula|racing)\b/.test(catText)) category = 'Cars';
    else if (/\b(space|rocket|spacecraft|satellite)\b/.test(catText)) category = 'Space';
    else if (/\b(figure|soldier)\b/.test(catText)) category = 'Figures';

    if (!name) return null;

    return {
      name,
      brand: brand || 'Unknown',
      scale: scale || 'Unknown',
      category,
      reference,
      barcode: barcode || (barcodeMatch ? barcodeMatch[1] : undefined),
      image_url,
      scalemates_url: url,
      year,
    };
  } catch {
    return null;
  }
}

function parseScalematesPageContent(data: any, barcode?: string): ScalematesKit[] {
  const results: ScalematesKit[] = [];
  const markdown = data.markdown || '';
  const links = data.links || [];

  const lines = markdown.split('\n');
  let currentKit: Partial<ScalematesKit> = {};

  for (const line of lines) {
    const scaleMatch = line.match(/1[:/]\d+/);
    if (scaleMatch && line.length > 10) {
      const scale = scaleMatch[0].replace(':', '/');
      const namePart = line.replace(scaleMatch[0], '').trim();

      if (namePart.length > 3) {
        currentKit = {
          name: namePart.split('|')[0]?.trim() || namePart,
          scale,
          brand: 'Unknown',
          category: 'Other',
          reference: '',
          barcode,
        };
        results.push(currentKit as ScalematesKit);
      }
    }
  }

  const smLinks = links.filter((l: string) => l.includes('scalemates.com/kits/'));
  for (let i = 0; i < Math.min(results.length, smLinks.length); i++) {
    results[i].scalemates_url = smLinks[i];
  }

  return results.slice(0, 5);
}
