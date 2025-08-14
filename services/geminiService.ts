import { GoogleGenAI } from "@google/genai";
import type { HealthManagementInput, GeminiResponse, FormattedResponse } from '../types';

const GEMINI_MODEL = "gemini-2.0-flash-001";

function getApiKey(): string {
  // Try environment variable first
  let apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  // Check if the API key is valid
  if (!apiKey || apiKey === 'undefined' || apiKey === '' || apiKey === 'null') {
    console.error("❌ No valid API key found in environment variables");
    throw new Error("VITE_GEMINI_API_KEY environment variable is not set. Please check your .env file and restart the development server.");
  }
  
  console.log("✅ API key loaded successfully:", apiKey.substring(0, 10) + "...");
  return apiKey;
}

function getAI(): GoogleGenAI {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("No API key available");
  }
  
  console.log("✅ Creating GoogleGenAI instance with key:", apiKey.substring(0, 10) + "...");
  
  try {
    const ai = new GoogleGenAI({ apiKey });
    console.log("✅ GoogleGenAI instance created successfully");
    return ai;
  } catch (error) {
    console.error("❌ Error creating GoogleGenAI instance:", error);
    throw error;
  }
}

function formatMedicalResponse(rawText: string, type: string): FormattedResponse {
  const lines = rawText.split('\n').filter(line => line.trim());
  
  const title = lines[0]?.replace(/^#+\s*/, '') || `${type} Information`;
  const summary = lines.slice(1, 3).join(' ').substring(0, 200) + '...';
  
  const sections: any[] = [];
  let currentSection: any = null;
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('#') || line.includes(':') && line.length < 50) {
      if (currentSection) sections.push(currentSection);
      currentSection = {
        heading: line.replace(/^#+\s*/, '').replace(':', ''),
        content: '',
        type: 'info',
        items: []
      };
    } else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      if (currentSection) {
        currentSection.type = 'list';
        currentSection.items.push(line.replace(/^[•\-*]\s*/, ''));
      }
    } else if (line.toLowerCase().includes('warning') || line.toLowerCase().includes('caution')) {
      if (currentSection) currentSection.type = 'warning';
      if (currentSection) currentSection.content += line + ' ';
    } else {
      if (currentSection) currentSection.content += line + ' ';
    }
  }
  
  if (currentSection) sections.push(currentSection);
  
  return {
    title,
    summary,
    sections,
    disclaimer: "This information is AI-generated and should not replace professional medical consultation."
  };
}

async function generateContent(prompt: string, systemInstruction: string): Promise<GeminiResponse> {
  try {
    console.log("🔄 Starting content generation...");
    
    const ai = getAI();
    console.log("✅ GoogleGenAI instance created");
    
    // Use the correct API structure for version 1.14.0
    console.log("🔍 Using ai.models.generateContent method");
    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction
      }
    });
    
    console.log("✅ Content generated");
    
    // Extract the text from the response
    const text = result.text || "No response generated";
    console.log("✅ Response extracted:", text ? 'Success' : 'Empty');
    
    return {
      text: text,
      candidates: result.candidates || []
    };
  } catch (error) {
    console.error('❌ Generation error:', error);
    return { text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export const geminiService = {
  async getMedicalConsultation(query: string): Promise<{ response: GeminiResponse; formatted: FormattedResponse }> {
    console.log("🩺 Starting medical consultation for:", query.substring(0, 50) + "...");
    
    const systemInstruction = `You are Dr. VitaShifa, an expert AI medical consultant. Provide helpful medical information about: ${query}`;

    const response = await generateContent(query, systemInstruction);
    const formatted = formatMedicalResponse(response.text, 'Medical Consultation');
    
    return { response, formatted };
  },

  async analyzeImage(base64Image: string, mimeType: string, prompt: string): Promise<{ response: GeminiResponse; formatted: FormattedResponse }> {
    console.log("🔍 Starting image analysis...");
    
    try {
      const ai = getAI();
      
      // Use the correct API structure for version 1.14.0
      console.log("🔍 Using ai.models.generateContent method with image");
      const result = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data: base64Image.split(',')[1] } }
            ]
          }
        ]
      });
      
      // Extract the text from the response
      const responseText = result.text || "No analysis generated";
      const geminiResponse = { text: responseText, candidates: result.candidates || [] };
      const formatted = formatMedicalResponse(responseText, 'Image Analysis');
      
      return { response: geminiResponse, formatted };
    } catch (error) {
      console.error('❌ Image analysis error:', error);
      const errorResponse = { text: `Analysis Error: ${error instanceof Error ? error.message : 'Unknown error'}` };
      return { response: errorResponse, formatted: formatMedicalResponse(errorResponse.text, 'Image Analysis') };
    }
  },

  async getWellnessPlan(input: HealthManagementInput): Promise<{ response: GeminiResponse; formatted: FormattedResponse }> {
    console.log("💪 Starting wellness plan generation...");
    
    const prompt = `Create a wellness plan for: ${JSON.stringify(input)}`;
    const systemInstruction = "You are a wellness coach. Create a helpful wellness plan.";

    const response = await generateContent(prompt, systemInstruction);
    const formatted = formatMedicalResponse(response.text, 'Wellness Plan');
    
    return { response, formatted };
  },

  async getEmergencyGuidance(situation: string): Promise<{ response: GeminiResponse; formatted: FormattedResponse }> {
    console.log("🚨 Starting emergency guidance...");
    
    const systemInstruction = "You are an emergency response guide. Provide helpful emergency guidance.";

    const response = await generateContent(situation, systemInstruction);
    const formatted = formatMedicalResponse(response.text, 'Emergency Guidance');
    
    return { response, formatted };
  }
};