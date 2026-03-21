// Centralized AI Configuration for TaskaZen
// Switch between Backend (Supabase Edge Function) and Direct (Frontend) call
export const AI_CONFIG = {
  USE_BACKEND: false, // Set to false to use direct Gemini API call from frontend
  MODEL_NAME: "gemini-pro",
  GEMINI_API_KEY: "AIzaSyBvxIOmOuOOdPDVgBsjK62BeAXmBWdOapE", // ใส่ API Key ของคุณที่นี่ (ได้จาก Google AI Studio)
};

const DIRECT_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

export const getAiUrl = (endpoint = "generateContent") => {
  return `${DIRECT_BASE_URL}/models/${AI_CONFIG.MODEL_NAME}:${endpoint}?key=${AI_CONFIG.GEMINI_API_KEY}`;
};
