// Centralized AI Configuration for TaskaZen
// Switch between Backend (Supabase Edge Function) and Direct (Frontend) call
export const AI_CONFIG = {
  USE_BACKEND: false, // Set to false to use direct Gemini API call from frontend
  MODEL_NAME: "gemini-1.5-flash", // กลับมาใช้ Flash รุ่นใหม่ที่ควรจะทำงานได้กับ Key ใหม่
  GEMINI_API_KEY: "AIzaSyC2h4b4UzszpHn4nb25dRjHGC3LWRJXCeY", // ใส่ API Key ของคุณที่นี่
};

const DIRECT_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

export const getAiUrl = (endpoint = "generateContent") => {
  return `${DIRECT_BASE_URL}/models/${AI_CONFIG.MODEL_NAME}:${endpoint}?key=${AI_CONFIG.GEMINI_API_KEY}`;
};
