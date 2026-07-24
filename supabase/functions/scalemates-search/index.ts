const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, barcode } = await req.json();
    const searchTerm = barcode || query;

    if (!searchTerm) {
      return new Response(
        JSON.stringify({ success: false, error: 'Query or barcode is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Searching Scalemates for:', searchTerm);

    // Step 1: Search Scalemates via Firecrawl web search
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
      return new Response(
        JSON.stringify({ success: false, error: 'Search failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: ScalematesKit[] = [];

    // Step 2: Parse search results to extract kit info
    if (searchData.data && Array.isArray(searchData.data)) {
      for (const result of searchData.data) {
        const kit = parseScalematesResult(result, barcode);
        if (kit) {
          results.push(kit);
        }
      }
    }

    // Step 3: If barcode search returned no results, try scraping Scalemates search page directly
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

    return new Response(
      JSON.stringify({ success: true, data: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
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

    // Extract scale (1/XX or 1:XX) from anywhere
    const scaleMatch = (title + ' ' + markdown).match(/Scale[:\s]*1[:/](\d+)/i) 
      || (title + ' ' + markdown).match(/1[:/](\d+)/);
    if (scaleMatch) {
      scale = scaleMatch[0].includes('Scale') 
        ? '1/' + scaleMatch[1] 
        : scaleMatch[0].replace(':', '/');
    }

    // Extract from structured markdown fields
    const numberMatch = markdown.match(/Number[:\s]*([A-Za-z0-9\-\.]+?)(?=Scale|Type|Released|Barcode|\s|$)/i);
    if (numberMatch) reference = numberMatch[1].trim();

    const releasedMatch = markdown.match(/Released[:\s]*(\d{4})/i);
    if (releasedMatch) year = parseInt(releasedMatch[1]);

    const barcodeMatch = markdown.match(/Barcode[:\s]*(\d+)/i);

    // Extract brand from markdown - look for [Brand](url) pattern or Brand: field
    const brandLinkMatch = markdown.match(/\[([A-Za-z][A-Za-z\s&\-\.]+)\]\(https:\/\/www\.scalemates\.com\/brands\//);
    if (brandLinkMatch) {
      brand = brandLinkMatch[1].trim();
    }

    // Extract title from markdown - look for Title: field
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

    // Fallback: parse from page title "Kit Name, Brand, No.REF, 1/XX | Scalemates"
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

    // Extract image URL
    const imgMatch = markdown.match(/!\[[^\]]*\]\(([^)]+scalemates[^)]*\.(jpg|jpeg|png|webp)[^)]*)\)/i);
    if (imgMatch) image_url = imgMatch[1];

    // Category detection
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

  // Try to parse kit entries from the search results page
  // Each kit entry typically has name, brand, scale
  const lines = markdown.split('\n');
  let currentKit: Partial<ScalematesKit> = {};

  for (const line of lines) {
    const scaleMatch = line.match(/1[:/]\d+/);
    if (scaleMatch && line.length > 10) {
      // This line likely contains kit info
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

  // Try to find scalemates URLs from links
  const smLinks = links.filter((l: string) => l.includes('scalemates.com/kits/'));
  for (let i = 0; i < Math.min(results.length, smLinks.length); i++) {
    results[i].scalemates_url = smLinks[i];
  }

  return results.slice(0, 5);
}
