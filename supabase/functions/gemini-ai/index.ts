// Follow Supabase Edge Function best practices
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);

  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // 2. Handle GET for Health Check (helps avoid 405 if called incorrectly)
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({ status: "ready", message: "Gemini AI Edge Function is active. Please use POST for AI requests." }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // 3. Validate Method
    if (req.method !== 'POST') {
      console.warn(`Method ${req.method} not allowed`);
      return new Response(
        JSON.stringify({ error: "Method Not Allowed. Please use POST." }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 3. Get API Key from Environment
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.error("Missing GEMINI_API_KEY");
      return new Response(
        JSON.stringify({ error: "Server Configuration Error: API Key not found." }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 4. Parse Request Body Safely
    let body;
    try {
      const bodyText = await req.text();
      if (!bodyText) {
        throw new Error("Empty request body");
      }
      body = JSON.parse(bodyText);
    } catch (parseErr) {
      console.error("Parse Error:", parseErr.message);
      return new Response(
        JSON.stringify({ error: "Invalid JSON input", details: parseErr.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { prompt, systemInstruction, useJson } = body;

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Missing required field: 'prompt'" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 5. Call Google Gemini API
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

    // Check for network errors
    if (!googleRes.ok) {
      const errorText = await googleRes.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: { message: errorText } };
      }
      
      console.error("Google API Error:", errorData);
      return new Response(
        JSON.stringify({
          error: "AI Service Error",
          message: errorData.error?.message || "Unknown error from Google"
        }),
        { 
          status: googleRes.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Read Google response as text first to avoid JSON parse errors
    const googleText = await googleRes.text();
    if (!googleText) {
      throw new Error("Empty response from Google AI");
    }

    let googleData;
    try {
      googleData = JSON.parse(googleText);
    } catch (parseErr) {
      console.error("Google JSON Parse Error:", parseErr.message);
      throw new Error("Invalid response format from Google AI");
    }

    const aiText = googleData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return new Response(
      JSON.stringify({ text: aiText }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (err: any) {
    console.error("Unexpected Error:", err.message);
    return new Response(
      JSON.stringify({
        error: "Edge Function Error",
        message: err.message || "An unexpected error occurred"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
