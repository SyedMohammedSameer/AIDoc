export enum NavigationTab {
  DRUG_INFO = 'consultation',
  IMAGE_ANALYSIS = 'diagnosis',
  HEALTH_MANAGEMENT = 'wellness',
  EMERGENCY_AID = 'emergency',
}

export interface NavItem {
  id: NavigationTab;
  label: string;
  icon: string;
  description: string;
}

export interface HealthManagementInput {
  chronicConditions: string[];
  currentSymptoms: string;
  lifestyleFactors: string;
  healthGoals: string;
}

export interface GeminiResponse {
  text: string;
  candidates?: any[];
}

export interface ConsultationLog {
  id: string;
  timestamp: Date;
  type: NavigationTab;
  query: string;
  response: string;
  userId?: string;
}

export interface FormattedResponse {
  title: string;
  summary: string;
  sections: ResponseSection[];
  disclaimer: string;
  sources?: string[];
}

export interface ResponseSection {
  heading: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'list';
  items?: string[];
}