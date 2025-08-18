import { NavigationTab } from './types';
import type { NavItem } from './types';

export const APP_TITLE = "VitaShifa";
export const APP_TAGLINE = "Your AI-Powered Health Companion";

export const NAVIGATION_ITEMS: NavItem[] = [
  { 
    id: NavigationTab.DRUG_INFO, 
    label: 'Medical Consultation', 
    labelKey: 'medicalConsultation',
    icon: 'MessageCircle',
    description: 'Get expert medical guidance and drug information',
    descriptionKey: 'medicalConsultationDesc'
  },
  { 
    id: NavigationTab.IMAGE_ANALYSIS, 
    label: 'AI Diagnosis', 
    labelKey: 'aiDiagnosis',
    icon: 'Scan',
    description: 'Analyze medical images with AI precision',
    descriptionKey: 'aiDiagnosisDesc'
  },
  { 
    id: NavigationTab.HEALTH_MANAGEMENT, 
    label: 'Wellness Planning', 
    labelKey: 'wellnessPlanning',
    icon: 'Heart',
    description: 'Personalized health and wellness strategies',
    descriptionKey: 'wellnessPlanningDesc'
  },
  { 
    id: NavigationTab.EMERGENCY_AID, 
    label: 'Emergency Care', 
    labelKey: 'emergencyCare',
    icon: 'AlertTriangle',
    description: 'Immediate first aid and emergency guidance',
    descriptionKey: 'emergencyCareDesc'
  },
];

export const GENERAL_DISCLAIMER = "VitaShifa provides AI-generated health information for educational purposes only. This is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical concerns.";

export const EMERGENCY_DISCLAIMER = "🚨 FOR MEDICAL EMERGENCIES: Call 911 or your local emergency services immediately. VitaShifa is not for emergency situations.";

// Changed from strings to translation keys
export const CHRONIC_CONDITIONS_KEYS = [
  "diabetes1", "diabetes2", "hypertension", "asthma", "arthritis",
  "heartDisease", "kidneyDisease", "copd", "depression", "anxiety",
  "thyroidDisorders", "migraine", "chronicPain", "sleepDisorders",
  "none", "other"
];