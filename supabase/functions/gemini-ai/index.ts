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
    // 2. Read Body
    const { prompt, systemInstruction, useJson } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Missing 'prompt' in request body" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 3. Get API Key
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not set in Supabase Secrets" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    // 4. Call Google Gemini API
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
        message: googleData.error?.message || "Unknown error from Google"
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
    return new Response(JSON.stringify({
      error: "Edge Function Error",
      message: err.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})