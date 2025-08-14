import { GoogleGenAI } from "@google/genai";
import type { HealthManagementInput, GeminiResponse, FormattedResponse } from '../types';
import { firebaseService } from './firebase';

const GEMINI_MODEL = "gemini-2.0-flash-exp";

// Initialize AI client lazily
function getAI(): GoogleGenAI | null {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("VITE_GEMINI_API_KEY not configured");
    return null;
  }
  
  try {
    return new GoogleGenAI(apiKey);
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
    return null;
  }
}

// Enhanced response formatter
function formatMedicalResponse(rawText: string, type: string): FormattedResponse {
  const lines = rawText.split('\n').filter(line => line.trim());
  
  // Extract title from first line or create one
  const title = lines[0]?.replace(/^#+\s*/, '') || `${type} Information`;
  
  // Create summary from first paragraph
  const summary = lines.slice(1, 3).join(' ').substring(0, 200) + '...';
  
  const sections: any[] = [];
  let currentSection: any = null;
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('#') || line.includes(':') && line.length < 50) {
      // New section
      if (currentSection) sections.push(currentSection);
      currentSection = {
        heading: line.replace(/^#+\s*/, '').replace(':', ''),
        content: '',
        type: 'info',
        items: []
      };
    } else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      // List item
      if (currentSection) {
        currentSection.type = 'list';
        currentSection.items.push(line.replace(/^[•\-*]\s*/, ''));
      }
    } else if (line.toLowerCase().includes('warning') || line.toLowerCase().includes('caution')) {
      if (currentSection) currentSection.type = 'warning';
      if (currentSection) currentSection.content += line + ' ';
    } else {
      // Regular content
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

async function generateContent(prompt: string, systemInstruction: string, useSearch = true): Promise<GeminiResponse> {
  const ai = getAI();
  if (!ai) {
    return { text: "API Error: Gemini API not configured" };
  }

  try {
    const model = ai.getGenerativeModel({ 
      model: GEMINI_MODEL,
      systemInstruction,
      tools: useSearch ? [{ googleSearch: {} }] : undefined
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return {
      text: response.text() || "No response generated",
      candidates: response.candidates
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    return { text: `API Error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export const geminiService = {
  async getMedicalConsultation(query: string): Promise<{ response: GeminiResponse; formatted: FormattedResponse }> {
    const systemInstruction = `You are Dr. VitaShifa, an expert AI medical consultant. Provide comprehensive, accurate medical information with the following structure:

# Medical Analysis
[Clear heading for the condition/query]

## Key Information
[Essential facts about the condition/medication]

## Symptoms & Signs
[If applicable, list symptoms to watch for]

## Treatment Options
[Available treatments, both medical and lifestyle]

## Important Considerations
[Warnings, contraindications, when to seek immediate help]

## Next Steps
[Recommended actions for the patient]

Always emphasize the importance of professional medical consultation. Use clear, patient-friendly language while maintaining medical accuracy.`;

    const response = await generateContent(query, systemInstruction);
    const formatted = formatMedicalResponse(response.text, 'Medical Consultation');
    
    // Log to Firebase
    await firebaseService.logConsultation({
      timestamp: new Date(),
      type: 'consultation' as any,
      query,
      response: response.text
    });
    
    return { response, formatted };
  },

  async analyzeImage(base64Image: string, mimeType: string, prompt: string): Promise<{ response: GeminiResponse; formatted: FormattedResponse }> {
    const systemInstruction = `You are Dr. VitaShifa's AI imaging specialist. Analyze medical images with this structure:

# Image Analysis Report
[Type of image and general assessment]

## Visual Observations
[Detailed description of what you observe]

## Potential Findings
[Possible conditions or abnormalities, if any]

## Recommendations
[Suggested follow-up actions]

## Limitations
[Acknowledge limitations of AI analysis]

Maintain professional medical terminology while being accessible to patients.`;

    const ai = getAI();
    if (!ai) {
      const errorResponse = { text: "API Error: Gemini API not configured" };
      return { response: errorResponse, formatted: formatMedicalResponse(errorResponse.text, 'Image Analysis') };
    }

    try {
      const model = ai.getGenerativeModel({ 
        model: GEMINI_MODEL,
        systemInstruction 
      });

      const result = await model.generateContent([
        prompt,
        { inlineData: { mimeType, data: base64Image.split(',')[1] } }
      ]);
      
      const response = await result.response;
      const responseText = response.text() || "No analysis generated";
      
      const geminiResponse = { text: responseText, candidates: response.candidates };
      const formatted = formatMedicalResponse(responseText, 'Image Analysis');
      
      // Log to Firebase
      await firebaseService.logConsultation({
        timestamp: new Date(),
        type: 'diagnosis' as any,
        query: `Image analysis: ${prompt}`,
        response: responseText
      });
      
      return { response: geminiResponse, formatted };
    } catch (error) {
      console.error('Image analysis error:', error);
      const errorResponse = { text: `Analysis Error: ${error instanceof Error ? error.message : 'Unknown error'}` };
      return { response: errorResponse, formatted: formatMedicalResponse(errorResponse.text, 'Image Analysis') };
    }
  },

  async getWellnessPlan(input: HealthManagementInput): Promise<{ response: GeminiResponse; formatted: FormattedResponse }> {
    const systemInstruction = `You are Dr. VitaShifa's wellness coach. Create personalized health plans with this structure:

# Your Personalized Wellness Plan
[Motivational opening based on their goals]

## Current Health Profile
[Summary of their conditions and lifestyle]

## Wellness Goals
[Their stated goals with realistic timelines]

## Nutrition Recommendations
[Specific dietary advice]

## Exercise & Activity Plan
[Tailored physical activity suggestions]

## Lifestyle Modifications
[Sleep, stress management, habits]

## Monitoring & Tracking
[What to track and how often]

## Medical Follow-up
[When to see healthcare providers]

Make recommendations specific, actionable, and encouraging.`;

    const prompt = `Create a comprehensive wellness plan for someone with:
    
Chronic Conditions: ${input.chronicConditions.join(', ') || 'None specified'}
Current Symptoms: ${input.currentSymptoms || 'None specified'}
Lifestyle: ${input.lifestyleFactors || 'Not specified'}
Goals: ${input.healthGoals || 'General wellness'}

Please provide specific, actionable recommendations.`;

    const response = await generateContent(prompt, systemInstruction, false);
    const formatted = formatMedicalResponse(response.text, 'Wellness Plan');
    
    // Log to Firebase
    await firebaseService.logConsultation({
      timestamp: new Date(),
      type: 'wellness' as any,
      query: prompt,
      response: response.text
    });
    
    return { response, formatted };
  },

  async getEmergencyGuidance(situation: string): Promise<{ response: GeminiResponse; formatted: FormattedResponse }> {
    const systemInstruction = `You are Dr. VitaShifa's emergency response AI. Provide immediate, life-saving guidance with this structure:

# 🚨 EMERGENCY RESPONSE PROTOCOL

## IMMEDIATE ACTIONS (First 60 seconds)
[Critical first steps - numbered list]

## SAFETY FIRST
[Safety considerations for responder and patient]

## STEP-BY-STEP PROCEDURE
[Detailed instructions in order]

## SIGNS TO WATCH FOR
[Warning signs that indicate worsening]

## WHEN TO CALL FOR HELP
[Clear criteria for emergency services]

## CONTINUE UNTIL HELP ARRIVES
[What to do while waiting]

ALWAYS start by emphasizing to call emergency services for serious situations. Keep instructions clear and calm.`;

    const response = await generateContent(situation, systemInstruction, false);
    const formatted = formatMedicalResponse(response.text, 'Emergency Guidance');
    
    // Log to Firebase
    await firebaseService.logConsultation({
      timestamp: new Date(),
      type: 'emergency' as any,
      query: situation,
      response: response.text
    });
    
    return { response, formatted };
  }
};