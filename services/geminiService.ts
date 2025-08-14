import { GoogleGenAI } from "@google/genai";
import type { HealthManagementInput, GeminiResponse, FormattedResponse } from '../types';

const GEMINI_MODEL = "gemini-2.0-flash-001";

function getApiKey(): string {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'undefined' || apiKey === '' || apiKey === 'null') {
    throw new Error("VITE_GEMINI_API_KEY environment variable is not set. Please check your .env file and restart the development server.");
  }
  
  return apiKey;
}

function getAI(): GoogleGenAI {
  const apiKey = getApiKey();
  
  try {
    return new GoogleGenAI({ apiKey });
  } catch (error) {
    throw error;
  }
}

function formatMedicalResponse(rawText: string, type: string): FormattedResponse {
  // Parse the response into sections for better formatting
  const lines = rawText.split('\n').filter(line => line.trim());
  
  const title = lines[0]?.replace(/^#+\s*/, '') || `${type} Information`;
  const summary = lines.slice(1, 3).join(' ').substring(0, 200) + '...';
  
  const sections: any[] = [];
  let currentSection: any = null;
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detect headers (lines with # or ending with :)
    if (line.startsWith('#') || (line.includes(':') && line.length < 80 && !line.includes('.'))) {
      if (currentSection) sections.push(currentSection);
      currentSection = {
        heading: line.replace(/^#+\s*/, '').replace(':', ''),
        content: '',
        type: 'info',
        items: []
      };
    } 
    // Detect list items
    else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line)) {
      if (currentSection) {
        currentSection.type = 'list';
        currentSection.items.push(line.replace(/^[•\-*]\s*/, '').replace(/^\d+\.\s*/, ''));
      }
    } 
    // Detect warnings
    else if (line.toLowerCase().includes('warning') || line.toLowerCase().includes('caution') || line.toLowerCase().includes('important')) {
      if (currentSection) currentSection.type = 'warning';
      if (currentSection) currentSection.content += line + ' ';
    } 
    // Regular content
    else {
      if (currentSection) {
        currentSection.content += line + ' ';
      } else {
        // Create a default section if none exists
        currentSection = {
          heading: 'Information',
          content: line + ' ',
          type: 'info',
          items: []
        };
      }
    }
  }
  
  if (currentSection) sections.push(currentSection);
  
  // If no sections were created, create a single section with all content
  if (sections.length === 0) {
    sections.push({
      heading: 'AI Response',
      content: rawText,
      type: 'info',
      items: []
    });
  }
  
  return {
    title,
    summary,
    sections,
    disclaimer: "This information is AI-generated and should not replace professional medical consultation."
  };
}

async function generateContent(prompt: string, systemInstruction: string): Promise<GeminiResponse> {
  try {
    const ai = getAI();
    
    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction
      }
    });
    
    const text = result.text || "No response generated";
    
    return {
      text: text,
      candidates: result.candidates || []
    };
  } catch (error) {
    return { text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export const geminiService = {
  async getMedicalConsultation(query: string): Promise<{ response: GeminiResponse; formatted: FormattedResponse }> {
    const systemInstruction = `You are Dr. VitaShifa, an expert AI medical consultant. 

Provide comprehensive, accurate medical information with clear structure:

1. Start with a brief summary of the condition/topic
2. Organize information into clear sections with headers like:
   - Key Information
   - Symptoms & Signs  
   - Treatment Options
   - Important Considerations
   - When to Seek Help

Use bullet points for lists and emphasize important warnings.
Always remind patients to consult healthcare professionals for medical decisions.
Be clear, accurate, and patient-friendly.`;

    const response = await generateContent(query, systemInstruction);
    const formatted = formatMedicalResponse(response.text, 'Medical Consultation');
    
    return { response, formatted };
  },

  async analyzeImage(base64Image: string, mimeType: string, prompt: string): Promise<{ response: GeminiResponse; formatted: FormattedResponse }> {
    try {
      const ai = getAI();
      
      const result = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          {
            role: "user",
            parts: [
              { text: `${prompt}\n\nPlease provide a structured analysis with clear sections and observations.` },
              { inlineData: { mimeType, data: base64Image.split(',')[1] } }
            ]
          }
        ]
      });
      
      const responseText = result.text || "No analysis generated";
      const geminiResponse = { text: responseText, candidates: result.candidates || [] };
      const formatted = formatMedicalResponse(responseText, 'Image Analysis');
      
      return { response: geminiResponse, formatted };
    } catch (error) {
      const errorResponse = { text: `Analysis Error: ${error instanceof Error ? error.message : 'Unknown error'}` };
      return { response: errorResponse, formatted: formatMedicalResponse(errorResponse.text, 'Image Analysis') };
    }
  },

  async getWellnessPlan(input: HealthManagementInput): Promise<{ response: GeminiResponse; formatted: FormattedResponse }> {
    const prompt = `Create a comprehensive wellness plan for someone with:
    
Chronic Conditions: ${input.chronicConditions.join(', ') || 'None specified'}
Current Symptoms: ${input.currentSymptoms || 'None specified'}
Lifestyle: ${input.lifestyleFactors || 'Not specified'}
Goals: ${input.healthGoals || 'General wellness'}

Please provide specific, actionable recommendations organized into clear sections.`;

    const systemInstruction = `You are Dr. VitaShifa's wellness coach. Create personalized health plans with this structure:

1. Current Health Assessment
2. Wellness Goals & Timeline  
3. Nutrition Recommendations
4. Exercise & Activity Plan
5. Lifestyle Modifications
6. Monitoring & Tracking
7. Medical Follow-up

Make recommendations specific, actionable, and encouraging. Use clear headers and bullet points.`;

    const response = await generateContent(prompt, systemInstruction);
    const formatted = formatMedicalResponse(response.text, 'Wellness Plan');
    
    return { response, formatted };
  },

  async getEmergencyGuidance(situation: string): Promise<{ response: GeminiResponse; formatted: FormattedResponse }> {
    const systemInstruction = `You are Dr. VitaShifa's emergency response AI. Provide immediate, life-saving guidance with this structure:

🚨 EMERGENCY RESPONSE PROTOCOL

1. IMMEDIATE ACTIONS (First 60 seconds)
2. Safety Considerations  
3. Step-by-Step Procedure
4. Warning Signs to Watch For
5. When to Call Emergency Services
6. Continue Until Help Arrives

ALWAYS emphasize calling emergency services for serious situations. Keep instructions clear, calm, and numbered.`;

    const response = await generateContent(situation, systemInstruction);
    const formatted = formatMedicalResponse(response.text, 'Emergency Guidance');
    
    return { response, formatted };
  }
};