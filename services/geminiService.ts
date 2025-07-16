import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { DEFAULT_SYSTEM_INSTRUCTION } from '../constants'; // Assuming GEMINI_TEXT_MODEL and GEMINI_VISION_MODEL are also defined here
import type { HealthManagementInput, GroundingChunk, GeminiResponse, GeminiCandidate } from '../types';

// IMPORTANT: Update these model names to the current stable or recommended versions
// As of July 2025, 'gemini-2.5-flash' is the stable general-purpose flash model.
// 'gemini-2.5-flash-lite' is a newer preview for even faster, cheaper use.
// 'gemini-1.5-pro' is a larger, more capable model.
// Choose the one that best fits your needs.
// For this fix, we'll use 'gemini-2.5-flash' as the default text model.
const GEMINI_TEXT_MODEL = "gemini-2.5-flash"; // Updated model name
const GEMINI_VISION_MODEL = "gemini-2.5-flash"; // Gemini 2.5 Flash also supports vision

const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
} else {
  console.error("API_KEY environment variable is not set. MediAI Assistant will not be able to connect to Gemini. Please ensure the API_KEY is correctly configured in your environment.");
}

// Utility to extract text and handle potential markdown ```json ```
const extractJsonString = (text: string): string => {
  let jsonStr = text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s; // Matches ```json ... ``` or ``` ... ```
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  return jsonStr;
};

// Utility to strip basic Markdown formatting from text
function stripMarkdown(text: string): string {
  return text
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // bold
    .replace(/(\*|_)(.*?)\1/g, '$2')    // italics
    .replace(/`([^`]+)`/g, '$1')          // inline code
    .replace(/^\s*[-*+]\s+/gm, '')      // unordered list
    .replace(/^\s*\d+\.\s+/gm, '')    // ordered list
    .replace(/#+\s/g, '')                // headers
    .replace(/>\s?/g, '')                // blockquotes
    .replace(/\n{2,}/g, '\n\n')        // collapse multiple newlines
    .trim();
}

async function generateContentWrapper(
  modelName: string,
  prompt: string | { parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> },
  systemInstruction: string = DEFAULT_SYSTEM_INSTRUCTION,
  disableThinking: boolean = false,
  isJsonOutput: boolean = false,
  useGoogleSearch: boolean = false
): Promise<GeminiResponse> {
  if (!ai) {
    return {
      text: "API Error: Gemini API key is not configured. Please set the API_KEY environment variable. The application's core functionalities will not work until this is resolved.",
      candidates: []
    };
  }

  try {
    const config: any = { systemInstruction };
    if (disableThinking && modelName === GEMINI_TEXT_MODEL) {
      // Note: thinkingConfig is not a standard configuration for generateContent.
      // If you intended to control model "thinking" or processing,
      // you might be referring to specific model parameters not generally exposed this way.
      // For now, I'll keep it as is, but be aware it might not have the intended effect
      // or could be specific to an older SDK version/feature.
      config.thinkingConfig = { thinkingBudget: 0 };
    }
    if (isJsonOutput) {
      config.responseMimeType = "application/json";
    }
    if (useGoogleSearch) {
      if (isJsonOutput) {
        console.warn("Google Search with JSON output might lead to unexpected behavior. Removing JSON output for this call.");
        delete config.responseMimeType; // Google Search often doesn't support JSON output directly from the model response.
      }
      config.tools = [{ googleSearch: {} }];
    }

    const genAiResponse: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: typeof prompt === 'string' ? [{ parts: [{ text: prompt }] }] : prompt,
      generationConfig: config, // Use generationConfig for model parameters
    });
    
    let responseText = "";

    // Try the official .text accessor first. Use it if it contains non-whitespace characters.
    if (typeof genAiResponse.text === 'string' && genAiResponse.text.trim() !== "") {
        responseText = genAiResponse.text;
    } 
    // If .text accessor didn't yield usable content, try manual extraction from candidates.
    // This is a fallback if genAiResponse.text is empty, null, undefined, or only whitespace.
    else if (genAiResponse.candidates && genAiResponse.candidates.length > 0) {
      const firstCandidate = genAiResponse.candidates[0];
      if (firstCandidate.content && firstCandidate.content.parts && firstCandidate.content.parts.length > 0) {
        // Concatenate text from all parts that have a 'text' property.
        responseText = firstCandidate.content.parts
          .filter(part => typeof part.text === 'string')
          .map(part => part.text)
          .join('');
      }
    }
    
    // Trim the final result and ensure it's a string.
    responseText = (responseText || "").trim(); 

    // The JSON extraction should happen on the potentially non-empty, trimmed string
    if (isJsonOutput && responseText && !useGoogleSearch) {
        responseText = extractJsonString(responseText);
    }

    // Strip Markdown formatting for plain text output (unless JSON output is requested)
    if (!isJsonOutput) {
      responseText = stripMarkdown(responseText);
    }

    return {
      text: responseText,
      candidates: genAiResponse.candidates as GeminiCandidate[] // Cast to our defined type
    };

  } catch (error) {
    console.error(`Gemini API Error (${modelName}):`, error);
    let errorMessage = "An unknown error occurred with the Gemini API.";
    if (error instanceof Error) {
        errorMessage = error.message;
    } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
    }
    
    if (errorMessage.toLowerCase().includes("api key not valid") || errorMessage.toLowerCase().includes("invalid api key")) {
        errorMessage = "The configured API Key is invalid or has been rejected by the service. Please verify your API_KEY environment variable.";
    } else if (errorMessage.toLowerCase().includes("not found")) {
        // Add specific message for model not found
        errorMessage = `The model '${modelName}' was not found or is not supported for this operation. Please check model availability.`;
    }

    return { text: `API Error: ${errorMessage}` };
  }
}

export const geminiService = {
  getDrugInformation: async (query: string): Promise<GeminiResponse> => {
    const systemInstruction = `You are a medical AI specializing in pharmacology. Provide detailed, accurate information about the drug queried, including its uses, dosage, side effects, interactions, and alternatives if applicable. Format the response clearly. Emphasize that this information is not a substitute for consultation with a healthcare professional.`;
    return generateContentWrapper(GEMINI_TEXT_MODEL, query, systemInstruction, false, false, true);
  },

  getMedicalAnswer: async (query: string): Promise<GeminiResponse> => {
    const systemInstruction = `You are a medical AI assistant. Answer the user's health-related question comprehensively and accurately. Cover symptoms, potential conditions, and general treatment approaches. Stress the importance of seeking diagnosis and treatment from a qualified medical doctor.`;
    return generateContentWrapper(GEMINI_TEXT_MODEL, query, systemInstruction, false, false, true);
  },

  analyzeMedicalImage: async (base64ImageData: string, mimeType: string, prompt: string): Promise<GeminiResponse> => {
    const systemInstruction = `You are an AI specialized in medical image analysis. Analyze the provided image based on the user's prompt. Describe your observations in detail, identify potential abnormalities, and suggest general areas for follow-up with a qualified radiologist or medical specialist. State clearly that your analysis is not a diagnosis and professional medical consultation is essential.`;
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64ImageData.split(',')[1], 
      },
    };
    const textPart = { text: prompt };
    
    const contents = { parts: [imagePart, textPart] };
    return generateContentWrapper(GEMINI_VISION_MODEL, contents, systemInstruction);
  },

  getHealthManagementAdvice: async (input: HealthManagementInput): Promise<GeminiResponse> => {
    const systemInstruction = `You are an AI health coach. Based on the provided health information (chronic conditions: ${input.chronicConditions.join(', ')}; symptoms: ${input.currentSymptoms}; lifestyle: ${input.lifestyleFactors}; goals: ${input.healthGoals}), generate a personalized health plan. Include advice on diet, exercise, symptom tracking, and mental wellness. Provide actionable, general recommendations. Emphasize that this plan is for informational purposes and should be discussed with a healthcare provider before implementation.`;
    const userPrompt = `Provide a health management plan based on these details:
    Chronic Conditions: ${input.chronicConditions.join(', ') || 'None specified'}
    Current Symptoms: ${input.currentSymptoms || 'None specified'}
    Lifestyle Factors: ${input.lifestyleFactors || 'Not specified'}
    Health Goals: ${input.healthGoals || 'Not specified'}`;
    return generateContentWrapper(GEMINI_TEXT_MODEL, userPrompt, systemInstruction);
  },

  getEmergencyGuidance: async (situation: string): Promise<GeminiResponse> => {
    const systemInstruction = `You are an AI providing emergency first aid information. Your priority is safety. ALWAYS START by advising the user to call emergency services (e.g., 911) if the situation is serious or life-threatening. Then, provide clear, step-by-step first aid instructions relevant to the described situation. Keep instructions concise and easy to follow under pressure. Reiterate that these instructions are for immediate assistance until professional help arrives and are not a substitute for professional medical care.`;
    return generateContentWrapper(GEMINI_TEXT_MODEL, situation, systemInstruction, true); 
  },
};