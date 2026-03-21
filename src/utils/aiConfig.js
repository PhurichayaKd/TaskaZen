// Centralized AI Configuration for TaskaZen
// Switch between Backend (Supabase Edge Function) and Direct (Frontend) call
export const AI_CONFIG = {
  USE_BACKEND: false, // Set to false to use direct Gemini API call from frontend
  MODEL_NAME: "gemini-1.5-flash",
  GEMINI_API_KEY: "AIzaSyCSE7E-AOS7c-mOUCEYy46FHu5a0J9ZrbI", // ใส่ API Key ของคุณที่นี่ (ได้จาก Google AI Studio)
};

const DIRECT_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

export const getAiUrl = (endpoint = "generateContent") => {
  return `${DIRECT_BASE_URL}/${AI_CONFIG.MODEL_NAME}:${endpoint}?key=${AI_CONFIG.GEMINI_API_KEY}`;
};
