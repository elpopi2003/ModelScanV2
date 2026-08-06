// scalemates-price — obtiene el precio medio de vendedores (EUR) de la página
// de un kit en scalemates.com y lo cachea en kits.avg_price. Se llama bajo
// demanda desde la ficha (solo la primera vez por kit). Requiere usuario
// autenticado y aplica rate-limit por usuario.
import { createClient } from 'npm:@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RATE_MAX = 40;
const RATE_WINDOW_SECONDS = 3600;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Media de los importes en EUR listados en el bloque Marketplace.
function parseAvgEurPrice(html: string): number | null {
  const idx = html.indexOf('Marketplace</h3>');
  const region = idx >= 0 ? html.slice(idx, idx + 8000) : html;
  const re = /(?:EUR|€)\s?([0-9]{1,4}(?:[.,][0-9]{2})?)|([0-9]{1,4}[.,][0-9]{2})\s?€/gi;
  const vals: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(region)) !== null) {
    const raw = (m[1] ?? m[2]).replace(',', '.');
    const n = parseFloat(raw);
    if (!isNaN(n) && n > 0 && n < 100000) vals.push(n);
  }
  if (vals.length === 0) return null;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round(avg * 100) / 100;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ success: false, error: 'No autorizado' }, 401);

    const url = Deno.env.get('SUPABASE_URL') ?? '';
    const supabase = createClient(url, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return json({ success: false, error: 'No autorizado' }, 401);

    const { id, url: kitUrl } = await req.json();
    if (!id || !kitUrl || !String(kitUrl).includes('scalemates.com')) {
      return json({ success: false, error: 'id y url de scalemates requeridos' }, 400);
    }

    // Cliente admin (service role) para leer/escribir la caché en kits.
    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
      auth: { persistSession: false },
    });

    // Caché: si ya se calculó, devolverlo sin gastar Firecrawl.
    const { data: cached } = await admin.from('kits').select('avg_price').eq('id', id).single();
    if (cached && cached.avg_price != null) {
      return json({ success: true, avg_price: Number(cached.avg_price), cached: true });
    }

    // Rate limit (antes de gastar Firecrawl)
    const { data: allowed, error: rlError } = await supabase.rpc('check_and_increment_rate_limit', {
      p_fn: 'scalemates-price',
      p_max: RATE_MAX,
      p_window_seconds: RATE_WINDOW_SECONDS,
    });
    if (!rlError && allowed === false) {
      return json({ success: false, error: 'Límite alcanzado. Inténtalo más tarde.' }, 429);
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) return json({ success: false, error: 'Firecrawl not configured' }, 500);

    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: kitUrl, formats: ['rawHtml'], onlyMainContent: false }),
    });
    const scrapeData = await scrapeResponse.json();
    if (!scrapeResponse.ok) {
      console.error('Firecrawl scrape error:', scrapeData);
      return json({ success: false, error: 'Scrape failed' }, 500);
    }

    const html = scrapeData?.data?.rawHtml ?? scrapeData?.data?.html ?? '';
    const avg = parseAvgEurPrice(html);

    // Cachear el resultado (avg puede ser null si no hay vendedores en EUR).
    await admin.from('kits').update({ avg_price: avg }).eq('id', id);

    return json({ success: true, avg_price: avg });
  } catch (error) {
    console.error('Error:', error);
    return json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});
