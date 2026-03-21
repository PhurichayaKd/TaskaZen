import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // 1. จัดการ CORS (ต้องทำเป็นอันดับแรก)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. อ่าน JSON โดยตรง (Deno จะจัดการ Stream ให้เอง)
    const body = await req.json();
    
    if (!body || !body.prompt) {
      throw new Error("Missing prompt in request body");
    }

    const { prompt, systemInstruction, useJson } = body;

    // 3. ตรวจสอบ API Key
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in Supabase Secrets");
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    // 4. เรียกใช้ Gemini
    const geminiRes = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
        generationConfig: useJson ? { responseMimeType: "application/json" } : undefined
      })
    });

    const data = await geminiRes.json();
    
    if (data.error) {
      throw new Error(`Google AI Error: ${data.error.message}`);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error("Function Error:", error.message);
    return new Response(JSON.stringify({ 
      error: "SERVER_ERROR", 
      message: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500, // ส่ง 500 เพื่อให้เรารู้ว่าติดที่ catch block
    });
  }
})