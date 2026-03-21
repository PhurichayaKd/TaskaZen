// Modern Supabase Edge Function (Deno.serve)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  console.log(`[gemini-ai] Incoming: ${req.method} ${url.pathname}`);

  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // 2. Health Check / Status
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({ status: "online", function: "gemini-ai" }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // 3. Method Check
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: "Method Not Allowed. Use POST." }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Get API Key
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.error("[gemini-ai] Missing API Key");
      return new Response(
        JSON.stringify({ error: "API Key not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Parse Request
    const bodyText = await req.text();
    if (!bodyText) {
      return new Response(
        JSON.stringify({ error: "Empty request body" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { prompt, systemInstruction, useJson } = body;
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Call Google Gemini
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const googlePayload = {
      contents: [{ parts: [{ text: prompt }] }],
      system_instruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
      generationConfig: useJson ? { responseMimeType: "application/json" } : undefined
    };

    const googleRes = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(googlePayload)
    });

    const googleText = await googleRes.text();
    if (!googleRes.ok) {
      console.error("[gemini-ai] Google Error:", googleText);
      return new Response(googleText, { 
        status: googleRes.status, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const googleData = JSON.parse(googleText);
    const aiText = googleData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return new Response(
      JSON.stringify({ text: aiText }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    console.error("[gemini-ai] Runtime Error:", err.message);
    return new Response(
      JSON.stringify({ error: "Runtime Error", message: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})

