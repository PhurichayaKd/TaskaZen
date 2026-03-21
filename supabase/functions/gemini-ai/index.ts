import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });
    }

    const body = await req.json();
    const { prompt, systemInstruction, useJson } = body;
    
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.error("Missing GEMINI_API_KEY");
      return new Response(JSON.stringify({ error: "SERVER_ERROR: API Key is missing in Supabase Secrets" }), { 
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        // แก้ไขจุดนี้: ใช้ system_instruction (snake_case)
        system_instruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
        generationConfig: useJson ? { responseMimeType: "application/json" } : undefined
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("Google API Error:", data.error);
      return new Response(JSON.stringify({ 
        error: `GOOGLE_AI_ERROR: ${data.error.message}`,
        code: data.error.status 
      }), { 
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err: any) {
    console.error("Runtime Error:", err.message);
    return new Response(JSON.stringify({ error: `RUNTIME_ERROR: ${err.message}` }), { 
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
})