export enum NavigationTab {
  DRUG_INFO = 'Drug Information & Q/A',
  IMAGE_ANALYSIS = 'Medical Image Analysis',
  HEALTH_MANAGEMENT = 'Health Management',
  EMERGENCY_AID = 'Emergency & First Aid',
}

export interface NavItem {
  id: NavigationTab;
  label: string;
  icon?: React.ReactNode;
}

export interface HealthManagementInput {
  chronicConditions: string[];
  currentSymptoms: string;
  lifestyleFactors: string;
  healthGoals: string;
}

export interface GroundingChunkWeb {
  // Fix: Made uri optional to match the type from @google/genai
  uri?: string;
  // Fix: Made title optional to match the type from @google/genai
  title?: string;
}

export interface GroundingChunk {
  web: GroundingChunkWeb;
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
}

export interface GeminiCandidate {
  groundingMetadata?: GroundingMetadata;
  // other candidate properties if needed
}

export interface GeminiResponse {
  text: string; // Assuming text is always available directly
  candidates?: GeminiCandidate[];
}