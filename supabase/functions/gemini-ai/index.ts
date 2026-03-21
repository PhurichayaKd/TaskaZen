import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// กำหนด CORS Headers เพื่อให้ Frontend เรียกใช้งานได้
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // ตอบกลับเมื่อ Browser ตรวจสอบสิทธิ์ (Preflight request)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, systemInstruction, useJson } = await req.json()
    
    // ดึง API Key จาก Secrets ที่ตั้งไว้ใน Supabase
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
        generationConfig: useJson ? { 
          responseMimeType: "application/json"
        } : undefined
      })
    })

    const data = await response.json()
    
    // ตรวจสอบ Error จาก Google
    if (data.error) throw new Error(data.error.message)

    const text = data.candidates[0].content.parts[0].text

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})