// Centralized AI Configuration for TaskaZen
// Backend Mode: Using Supabase Edge Functions for security
export const AI_CONFIG = {
  USE_BACKEND: true, // Set to true to use Supabase Edge Functions
  FUNCTION_NAME: "gemini-ai",
  MODEL_NAME: "gemini-1.5-flash",
};

// This URL is only used if USE_BACKEND is false (Direct Client Call)
const DIRECT_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const DIRECT_KEY = "YOUR_API_KEY_HERE"; 

export const getAiUrl = (endpoint = "generateContent") => {
  return `${DIRECT_BASE_URL}/${AI_CONFIG.MODEL_NAME}:${endpoint}?key=${DIRECT_KEY}`;
};
