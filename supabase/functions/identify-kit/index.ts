const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ success: false, error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'LOVABLE_API_KEY is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract base64 data and mime type from data URL
    const match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (!match) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid image format. Expected data URL.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const mimeType = match[1];
    const base64Data = match[2];

    console.log('Identifying kit from box image...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert in scale model kits (plastic model kits for hobbyists). 
You will be shown a photo of a model kit box. Identify the kit and extract structured information.
You MUST respond using the provided tool/function.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Identify this scale model kit from the box photo. Extract the kit name, brand/manufacturer, scale, category (Aircraft, Armor, Ships, Cars, Space, Figures, or Other), reference/kit number, and year if visible.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Data}`
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'identify_kit',
              description: 'Return the identified kit information from the box photo.',
              parameters: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Full kit name (e.g. "Supermarine Spitfire Mk.Vb")' },
                  brand: { type: 'string', description: 'Manufacturer/brand (e.g. "Tamiya", "Revell", "Airfix")' },
                  scale: { type: 'string', description: 'Scale in format 1/XX (e.g. "1/48", "1/72")' },
                  category: { type: 'string', enum: ['Aircraft', 'Armor', 'Ships', 'Cars', 'Space', 'Figures', 'Other'], description: 'Kit category' },
                  reference: { type: 'string', description: 'Kit/catalog number (e.g. "61033")' },
                  year: { type: 'integer', description: 'Release year if visible' },
                  confidence: { type: 'number', description: 'Confidence level 0-1' }
                },
                required: ['name', 'brand', 'scale', 'category', 'confidence'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'identify_kit' } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Demasiadas solicitudes. Inténtalo de nuevo en unos segundos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'Créditos agotados. Añade fondos a tu workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const text = await response.text();
      console.error('AI gateway error:', response.status, text);
      return new Response(
        JSON.stringify({ success: false, error: 'Error del servicio de IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI response:', JSON.stringify(data));

    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return new Response(
        JSON.stringify({ success: false, error: 'No se pudo identificar el kit' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const kit = JSON.parse(toolCall.function.arguments);
    console.log('Identified kit:', kit);

    return new Response(
      JSON.stringify({ success: true, data: kit }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
