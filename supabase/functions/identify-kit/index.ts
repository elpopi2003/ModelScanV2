// identify-kit — identifica un kit de maqueta a partir de la foto de la caja
// usando la API de Google Gemini (visión) con salida estructurada (responseSchema).
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') || 'gemini-flash-latest';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Esquema de salida (Google Schema — tipos en MAYÚSCULAS)
const responseSchema = {
  type: 'OBJECT',
  properties: {
    name: { type: 'STRING' },
    brand: { type: 'STRING' },
    scale: { type: 'STRING' },
    category: {
      type: 'STRING',
      enum: ['Aircraft', 'Armor', 'Ships', 'Cars', 'Space', 'Figures', 'Other'],
    },
    reference: { type: 'STRING' },
    year: { type: 'INTEGER' },
    confidence: { type: 'NUMBER' },
  },
  required: ['name', 'brand', 'scale', 'category', 'confidence'],
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    if (!image) {
      return json({ success: false, error: 'Image data is required' }, 400);
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      return json({ success: false, error: 'GEMINI_API_KEY is not configured' }, 500);
    }

    // Extrae mime-type y base64 de la data URL
    const match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (!match) {
      return json({ success: false, error: 'Invalid image format. Expected data URL.' }, 400);
    }
    const mimeType = match[1];
    const base64Data = match[2];

    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text:
              'You are an expert in scale model kits (plastic model kits for hobbyists). ' +
              'You are shown a photo of a model kit box. Identify the kit and extract structured ' +
              'information. Respond ONLY with JSON matching the provided schema.',
          }],
        },
        contents: [{
          role: 'user',
          parts: [
            {
              text:
                'Identify this scale model kit from the box photo. Extract the kit name, ' +
                'brand/manufacturer, scale (format 1/XX), category (Aircraft, Armor, Ships, Cars, ' +
                'Space, Figures, or Other), reference/kit number, and release year if visible. ' +
                'confidence is your certainty from 0 to 1.',
            },
            { inlineData: { mimeType, data: base64Data } },
          ],
        }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema,
          temperature: 0.1,
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Gemini error:', response.status, text);
      if (response.status === 429) {
        return json({ success: false, error: 'Demasiadas solicitudes. Inténtalo de nuevo en unos segundos.' }, 429);
      }
      if (response.status === 400 || response.status === 403) {
        return json({ success: false, error: 'Error de configuración de la IA (revisa GEMINI_API_KEY / cuota).' }, 500);
      }
      return json({ success: false, error: 'Error del servicio de IA' }, 500);
    }

    const data = await response.json();
    const textOut = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textOut) {
      return json({ success: false, error: 'No se pudo identificar el kit' }, 200);
    }

    let kit: unknown;
    try {
      kit = JSON.parse(textOut);
    } catch {
      return json({ success: false, error: 'Respuesta de IA no válida' }, 200);
    }

    return json({ success: true, data: kit }, 200);
  } catch (error) {
    console.error('Error:', error);
    return json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' }, 500);
  }
});
