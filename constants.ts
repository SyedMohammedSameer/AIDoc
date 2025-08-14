import { NavigationTab } from './types';
import type { NavItem } from './types';

export const APP_TITLE = "VitaShifa";
export const APP_TAGLINE = "Your AI-Powered Health Companion";

export const NAVIGATION_ITEMS: NavItem[] = [
  { 
    id: NavigationTab.DRUG_INFO, 
    label: 'Medical Consultation', 
    icon: 'MessageCircle',
    description: 'Get expert medical guidance and drug information'
  },
  { 
    id: NavigationTab.IMAGE_ANALYSIS, 
    label: 'AI Diagnosis', 
    icon: 'Scan',
    description: 'Analyze medical images with AI precision'
  },
  { 
    id: NavigationTab.HEALTH_MANAGEMENT, 
    label: 'Wellness Planning', 
    icon: 'Heart',
    description: 'Personalized health and wellness strategies'
  },
  { 
    id: NavigationTab.EMERGENCY_AID, 
    label: 'Emergency Care', 
    icon: 'AlertTriangle',
    description: 'Immediate first aid and emergency guidance'
  },
];

export const GENERAL_DISCLAIMER = "VitaShifa provides AI-generated health information for educational purposes only. This is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical concerns.";

export const EMERGENCY_DISCLAIMER = "🚨 FOR MEDICAL EMERGENCIES: Call 911 or your local emergency services immediately. VitaShifa is not for emergency situations.";

export const CHRONIC_CONDITIONS_OPTIONS = [
  "Diabetes Type 1", "Diabetes Type 2", "Hypertension", "Asthma", "Arthritis",
  "Heart Disease", "Chronic Kidney Disease", "COPD", "Depression", "Anxiety",
  "Thyroid Disorders", "Migraine", "Chronic Pain", "Sleep Disorders",
  "None", "Other (please specify)"
];