
import { NavigationTab } from './types';
import type { NavItem } from './types';

export const APP_TITLE = "MediAI Assistant";

export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash-preview-04-17';
export const GEMINI_VISION_MODEL = 'gemini-2.5-flash-preview-04-17'; // This model can handle vision


export const NAVIGATION_ITEMS: NavItem[] = [
  { id: NavigationTab.DRUG_INFO, label: 'Drug Info & Q/A' },
  { id: NavigationTab.IMAGE_ANALYSIS, label: 'Image Analysis' },
  { id: NavigationTab.HEALTH_MANAGEMENT, label: 'Health Management' },
  { id: NavigationTab.EMERGENCY_AID, label: 'Emergency Aid' },
];

export const GENERAL_DISCLAIMER = "This AI tool provides information and suggestions for educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read or received from this tool.";
export const EMERGENCY_DISCLAIMER = "IF YOU ARE EXPERIENCING A MEDICAL EMERGENCY, CALL 911 OR YOUR LOCAL EMERGENCY NUMBER IMMEDIATELY. This tool is not for emergency situations.";

export const DEFAULT_SYSTEM_INSTRUCTION = "You are a helpful medical information assistant. Provide clear, concise, and accurate information. Your responses should be empathetic and informative. Crucially, always remind the user that your advice is not a substitute for professional medical consultation and to consult a healthcare professional for any medical concerns or before making any health decisions.";

export const CHRONIC_CONDITIONS_OPTIONS = [
  "Diabetes",
  "Hypertension (High Blood Pressure)",
  "Asthma",
  "Arthritis",
  "Heart Disease",
  "Chronic Kidney Disease",
  "COPD",
  "Depression",
  "Anxiety",
  "None",
  "Other (please specify)"
];
    