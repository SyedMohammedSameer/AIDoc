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

// Standard JSON structure for all responses
const JSON_RESPONSE_SCHEMA = `
{
  "title": "Brief, clear title for the response",
  "summary": "2-3 sentence overview of the key points",
  "sections": [
    {
      "heading": "Section Title",
      "content": "Main paragraph content for this section",
      "type": "info|warning|success",
      "items": ["Optional bullet point 1", "Optional bullet point 2"]
    }
  ]
}`;

function parseStructuredResponse(rawText: string, fallbackTitle: string): FormattedResponse {
  try {
    // Try to extract JSON from the response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        title: parsed.title || fallbackTitle,
        summary: parsed.summary || "AI-generated medical information",
        sections: parsed.sections || [],
        disclaimer: "This information is AI-generated and should not replace professional medical consultation."
      };
    }
  } catch (error) {
    console.warn("Failed to parse JSON response, using fallback formatting");
  }
  
  // Fallback: create a single section with cleaned content
  const cleanText = rawText
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/#{1,6}\s*/g, '')
    .trim();
    
  return {
    title: fallbackTitle,
    summary: cleanText.substring(0, 150) + "...",
    sections: [{
      heading: "Information",
      content: cleanText,
      type: "info" as const,
      items: []
    }],
    disclaimer: "This information is AI-generated and should not replace professional medical consultation."
  };
}

async function generateStructuredContent(prompt: string, systemInstruction: string): Promise<GeminiResponse> {
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
  async getMedicalConsultation(query: string, languageName: string): Promise<{ response: GeminiResponse; formatted: FormattedResponse }> {
    const systemInstruction = `You are Dr. VitaShifa, an expert AI medical consultant.

CRITICAL: You MUST respond in ${languageName}. Your entire response must be in ${languageName}.

You MUST respond with EXACTLY this JSON structure - no additional text before or after:

${JSON_RESPONSE_SCHEMA}

Rules for Medical Consultation responses:
1. Create EXACTLY 4 sections with these headings:
   - "Overview" (brief explanation of condition/topic)
   - "Key Symptoms" (main signs to look for)  
   - "Treatment Options" (what can be done)
   - "When to Seek Help" (warning signs/next steps)

2. Each section should have:
   - Clear heading
   - 1-2 sentences of content
   - 2-4 bullet points with specific details
   - Appropriate type: "info", "warning", or "success"

3. Keep content concise but medically accurate
4. Always include safety guidance
5. Use "warning" type for urgent/safety information

Example query: "I have a headache and fever"
Your response should be the JSON structure with relevant medical information.`;

    const response = await generateStructuredContent(query, systemInstruction);
    const formatted = parseStructuredResponse(response.text, 'Medical Consultation');
    
    return { response, formatted };
  },

  async analyzeImage(base64Image: string, mimeType: string, prompt: string, languageName: string): Promise<{ response: GeminiResponse; formatted: FormattedResponse }> {
    const systemInstruction = `You are Dr. VitaShifa's medical imaging AI specialist.

CRITICAL: You MUST respond in ${languageName}. Your entire response must be in ${languageName}.

You MUST respond with EXACTLY this JSON structure - no additional text before or after:

${JSON_RESPONSE_SCHEMA}

Rules for Image Analysis responses:
1. Create EXACTLY 4 sections with these headings:
   - "Image Overview" (what type of image and general quality)
   - "Key Observations" (main findings visible)
   - "Potential Findings" (what these observations might indicate)
   - "Recommendations" (next steps and professional consultation)

2. Each section should have:
   - Clear heading
   - 1-2 sentences of content explaining the observation
   - 2-4 bullet points with specific details
   - Use "warning" type for concerning findings

3. Always emphasize this is not diagnostic
4. Be thorough but avoid over-interpretation
5. Include disclaimer about professional interpretation

Analyze the medical image and provide structured observations.`;

    try {
      const ai = getAI();
      
      const result = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          {
            role: "user",
            parts: [
              { text: `${prompt}\n\nAnalyze this medical image following the JSON structure requirements.` },
              { inlineData: { mimeType, data: base64Image.split(',')[1] } }
            ]
          }
        ],
        config: {
          systemInstruction: systemInstruction
        }
      });
      
      const responseText = result.text || "No analysis generated";
      const geminiResponse = { text: responseText, candidates: result.candidates || [] };
      const formatted = parseStructuredResponse(responseText, 'Medical Image Analysis');
      
      return { response: geminiResponse, formatted };
    } catch (error) {
      const errorResponse = { text: `Analysis Error: ${error instanceof Error ? error.message : 'Unknown error'}` };
      return { response: errorResponse, formatted: parseStructuredResponse(errorResponse.text, 'Image Analysis Error') };
    }
  },

  async getWellnessPlan(input: HealthManagementInput, languageName: string): Promise<{ response: GeminiResponse; formatted: FormattedResponse }> {
    const prompt = `Create a comprehensive wellness plan for someone with:
    
Chronic Conditions: ${input.chronicConditions.join(', ') || 'None specified'}
Current Symptoms: ${input.currentSymptoms || 'None specified'}
Lifestyle: ${input.lifestyleFactors || 'Not specified'}
Goals: ${input.healthGoals || 'General wellness'}`;

    const systemInstruction = `You are Dr. VitaShifa's wellness coach creating personalized health plans.

CRITICAL: You MUST respond in ${languageName}. Your entire response must be in ${languageName}.

You MUST respond with EXACTLY this JSON structure - no additional text before or after:

${JSON_RESPONSE_SCHEMA}

Rules for Wellness Plan responses:
1. Create EXACTLY 4 sections with these headings:
   - "Health Assessment" (current status analysis)
   - "Nutrition Plan" (dietary recommendations)
   - "Activity & Exercise" (physical activity guidance)
   - "Lifestyle Changes" (habits and monitoring)

2. Each section should have:
   - Clear heading
   - 1-2 sentences explaining the approach
   - 3-5 specific, actionable bullet points
   - Use "success" type for positive recommendations

3. Make recommendations:
   - Specific and actionable
   - Appropriate for the person's conditions
   - Encouraging and realistic
   - Include monitoring suggestions

4. Always emphasize professional medical consultation for chronic conditions`;

    const response = await generateStructuredContent(prompt, systemInstruction);
    const formatted = parseStructuredResponse(response.text, 'Personalized Wellness Plan');
    
    return { response, formatted };
  },

  async getEmergencyGuidance(situation: string, languageName: string): Promise<{ response: GeminiResponse; formatted: FormattedResponse }> {
    const systemInstruction = `You are Dr. VitaShifa's emergency response AI providing life-saving guidance.

CRITICAL: You MUST respond in ${languageName}. Your entire response must be in ${languageName}.

You MUST respond with EXACTLY this JSON structure - no additional text before or after:

${JSON_RESPONSE_SCHEMA}

Rules for Emergency Guidance responses:
1. Create EXACTLY 4 sections with these headings:
   - "Immediate Actions" (first 60 seconds)
   - "Safety Steps" (securing the situation)
   - "Ongoing Care" (until help arrives)
   - "When to Call 911" (escalation criteria)

2. Each section should have:
   - Clear heading
   - 1-2 sentences with urgency context
   - 3-5 numbered/specific action steps
   - Use "warning" type for critical safety information

3. Content must be:
   - Clear and actionable
   - Appropriate for non-medical persons
   - Emphasize professional emergency services
   - Include specific warning signs

4. ALWAYS prioritize calling emergency services for serious situations
5. Keep instructions calm, clear, and numbered`;

    const response = await generateStructuredContent(situation, systemInstruction);
    const formatted = parseStructuredResponse(response.text, 'Emergency Guidance');
    
    return { response, formatted };
  }
};