import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // 1. Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: "Method not allowed. Use POST." }), { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // 2. Read Body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON or empty body", details: e.message }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const { prompt, systemInstruction, useJson } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Missing 'prompt' in request body" }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // 3. Get API Key
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Backend Config Error: GEMINI_API_KEY is missing in Supabase Secrets" }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // 4. Call Google Gemini API
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const googlePayload = {
      contents: [{ parts: [{ text: prompt }] }],
      system_instruction: systemInstruction ? {
        parts: [{ text: systemInstruction }]
      } : undefined,
      generationConfig: useJson ? {
        responseMimeType: "application/json"
      } : undefined
    };

    const googleRes = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(googlePayload)
    });

    const googleData = await googleRes.json();

    if (!googleRes.ok) {
      return new Response(JSON.stringify({ 
        error: "Google AI API Error", 
        details: googleData.error?.message || "Unknown error from Google",
        status: googleRes.status
      }), { 
        status: googleRes.status, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const aiText = googleData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return new Response(JSON.stringify({ text: aiText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err: any) {
    console.error("Critical Function Error:", err);
    return new Response(JSON.stringify({ 
      error: "Edge Function Runtime Error", 
      message: err.message 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
})