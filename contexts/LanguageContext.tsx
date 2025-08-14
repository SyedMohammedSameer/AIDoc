// contexts/LanguageContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
};

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
];

type Translations = {
  [key: string]: {
    [key: string]: string;
  };
};

const translations: Translations = {
  en: {
    // App
    appTitle: 'VitaShifa',
    appTagline: 'Your AI-Powered Health Companion',
    
    // Navigation
    medicalConsultation: 'Medical Consultation',
    medicalConsultationDesc: 'Get expert medical guidance and drug information',
    aiDiagnosis: 'AI Diagnosis',
    aiDiagnosisDesc: 'Analyze medical images with AI precision',
    wellnessPlanning: 'Wellness Planning',
    wellnessPlanningDesc: 'Personalized health and wellness strategies',
    emergencyCare: 'Emergency Care',
    emergencyCareDesc: 'Immediate first aid and emergency guidance',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    submit: 'Submit',
    cancel: 'Cancel',
    close: 'Close',
    next: 'Next',
    previous: 'Previous',
    
    // Medical Consultation
    askAbout: 'What would you like to consult about?',
    consultationPlaceholder: 'e.g., "I have a headache and feel nauseous. What could this be?" or "Tell me about the side effects of aspirin"',
    getConsultation: 'Get Consultation',
    
    // Image Analysis
    uploadImage: 'Upload Medical Image',
    analysisInstructions: 'Analysis Instructions',
    analyzeImage: 'Analyze Image',
    
    // Emergency
    emergencyTitle: 'Emergency First Aid Guidance',
    emergencyDescription: 'Immediate assistance while professional help is on the way',
    callEmergency: 'CALL EMERGENCY SERVICES IMMEDIATELY!',
    
    // Disclaimers
    medicalDisclaimer: 'This AI consultation is for informational purposes only and does not replace professional medical advice. Always consult with healthcare providers for medical concerns.',
    emergencyDisclaimer: '🚨 FOR MEDICAL EMERGENCIES: Call 911 or your local emergency services immediately. VitaShifa is not for emergency situations.',
    
    // Settings
    language: 'Language',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
  },
  es: {
    // App
    appTitle: 'VitaShifa',
    appTagline: 'Tu Compañero de Salud con IA',
    
    // Navigation
    medicalConsultation: 'Consulta Médica',
    medicalConsultationDesc: 'Obtén orientación médica experta e información sobre medicamentos',
    aiDiagnosis: 'Diagnóstico IA',
    aiDiagnosisDesc: 'Analiza imágenes médicas con precisión de IA',
    wellnessPlanning: 'Planificación de Bienestar',
    wellnessPlanningDesc: 'Estrategias personalizadas de salud y bienestar',
    emergencyCare: 'Cuidados de Emergencia',
    emergencyCareDesc: 'Primeros auxilios inmediatos y orientación de emergencia',
    
    // Common
    loading: 'Cargando...',
    error: 'Error',
    submit: 'Enviar',
    cancel: 'Cancelar',
    close: 'Cerrar',
    next: 'Siguiente',
    previous: 'Anterior',
    
    // Medical Consultation
    askAbout: '¿Sobre qué te gustaría consultar?',
    consultationPlaceholder: 'ej., "Tengo dolor de cabeza y náuseas. ¿Qué podría ser?" o "Cuéntame sobre los efectos secundarios de la aspirina"',
    getConsultation: 'Obtener Consulta',
    
    // Image Analysis
    uploadImage: 'Subir Imagen Médica',
    analysisInstructions: 'Instrucciones de Análisis',
    analyzeImage: 'Analizar Imagen',
    
    // Emergency
    emergencyTitle: 'Orientación de Primeros Auxilios de Emergencia',
    emergencyDescription: 'Asistencia inmediata mientras llega la ayuda profesional',
    callEmergency: '¡LLAMA A LOS SERVICIOS DE EMERGENCIA INMEDIATAMENTE!',
    
    // Disclaimers
    medicalDisclaimer: 'Esta consulta de IA es solo para fines informativos y no reemplaza el consejo médico profesional. Siempre consulta con proveedores de atención médica para problemas médicos.',
    emergencyDisclaimer: '🚨 PARA EMERGENCIAS MÉDICAS: Llama al 911 o a tus servicios de emergencia locales inmediatamente. VitaShifa no es para situaciones de emergencia.',
    
    // Settings
    language: 'Idioma',
    darkMode: 'Modo Oscuro',
    lightMode: 'Modo Claro',
  },
  fr: {
    // App
    appTitle: 'VitaShifa',
    appTagline: 'Votre Compagnon Santé Alimenté par IA',
    
    // Navigation
    medicalConsultation: 'Consultation Médicale',
    medicalConsultationDesc: 'Obtenez des conseils médicaux experts et des informations sur les médicaments',
    aiDiagnosis: 'Diagnostic IA',
    aiDiagnosisDesc: 'Analysez les images médicales avec la précision de l\'IA',
    wellnessPlanning: 'Planification du Bien-être',
    wellnessPlanningDesc: 'Stratégies personnalisées de santé et bien-être',
    emergencyCare: 'Soins d\'Urgence',
    emergencyCareDesc: 'Premiers secours immédiats et conseils d\'urgence',
    
    // Common
    loading: 'Chargement...',
    error: 'Erreur',
    submit: 'Soumettre',
    cancel: 'Annuler',
    close: 'Fermer',
    next: 'Suivant',
    previous: 'Précédent',
    
    // Medical Consultation
    askAbout: 'Sur quoi aimeriez-vous consulter?',
    consultationPlaceholder: 'ex., "J\'ai mal à la tête et des nausées. Qu\'est-ce que cela pourrait être?" ou "Parlez-moi des effets secondaires de l\'aspirine"',
    getConsultation: 'Obtenir une Consultation',
    
    // Image Analysis
    uploadImage: 'Télécharger une Image Médicale',
    analysisInstructions: 'Instructions d\'Analyse',
    analyzeImage: 'Analyser l\'Image',
    
    // Emergency
    emergencyTitle: 'Conseils de Premiers Secours d\'Urgence',
    emergencyDescription: 'Assistance immédiate en attendant l\'aide professionnelle',
    callEmergency: 'APPELEZ LES SERVICES D\'URGENCE IMMÉDIATEMENT!',
    
    // Disclaimers
    medicalDisclaimer: 'Cette consultation IA est à des fins informatives seulement et ne remplace pas les conseils médicaux professionnels. Consultez toujours les professionnels de la santé pour les préoccupations médicales.',
    emergencyDisclaimer: '🚨 POUR LES URGENCES MÉDICALES: Appelez le 15 ou vos services d\'urgence locaux immédiatement. VitaShifa n\'est pas pour les situations d\'urgence.',
    
    // Settings
    language: 'Langue',
    darkMode: 'Mode Sombre',
    lightMode: 'Mode Clair',
  },
  de: {
    // App
    appTitle: 'VitaShifa',
    appTagline: 'Ihr KI-gestützter Gesundheitsbegleiter',
    
    // Navigation
    medicalConsultation: 'Medizinische Beratung',
    medicalConsultationDesc: 'Erhalten Sie fachkundige medizinische Beratung und Medikamenteninformationen',
    aiDiagnosis: 'KI-Diagnose',
    aiDiagnosisDesc: 'Analysieren Sie medizinische Bilder mit KI-Präzision',
    wellnessPlanning: 'Wellness-Planung',
    wellnessPlanningDesc: 'Personalisierte Gesundheits- und Wellness-Strategien',
    emergencyCare: 'Notfallversorgung',
    emergencyCareDesc: 'Sofortige Erste Hilfe und Notfallberatung',
    
    // Common
    loading: 'Laden...',
    error: 'Fehler',
    submit: 'Senden',
    cancel: 'Abbrechen',
    close: 'Schließen',
    next: 'Weiter',
    previous: 'Zurück',
    
    // Medical Consultation
    askAbout: 'Worüber möchten Sie sich beraten lassen?',
    consultationPlaceholder: 'z.B. "Ich habe Kopfschmerzen und fühle mich übel. Was könnte das sein?" oder "Erzählen Sie mir von den Nebenwirkungen von Aspirin"',
    getConsultation: 'Beratung Erhalten',
    
    // Image Analysis
    uploadImage: 'Medizinisches Bild Hochladen',
    analysisInstructions: 'Analyse-Anweisungen',
    analyzeImage: 'Bild Analysieren',
    
    // Emergency
    emergencyTitle: 'Notfall-Erste-Hilfe-Beratung',
    emergencyDescription: 'Sofortige Hilfe, während professionelle Hilfe unterwegs ist',
    callEmergency: 'RUFEN SIE SOFORT DEN NOTDIENST!',
    
    // Disclaimers
    medicalDisclaimer: 'Diese KI-Beratung dient nur zu Informationszwecken und ersetzt nicht die professionelle medizinische Beratung. Konsultieren Sie bei medizinischen Problemen immer Gesundheitsdienstleister.',
    emergencyDisclaimer: '🚨 FÜR MEDIZINISCHE NOTFÄLLE: Rufen Sie sofort 112 oder Ihre örtlichen Notdienste an. VitaShifa ist nicht für Notfallsituationen gedacht.',
    
    // Settings
    language: 'Sprache',
    darkMode: 'Dunkler Modus',
    lightMode: 'Heller Modus',
  },
  // Add more languages as needed...
};

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(SUPPORTED_LANGUAGES[0]);

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('vitashifa-language');
    if (savedLanguage) {
      const found = SUPPORTED_LANGUAGES.find(lang => lang.code === savedLanguage);
      if (found) {
        setCurrentLanguage(found);
      }
    } else {
      // Detect browser language
      const browserLang = navigator.language.split('-')[0];
      const found = SUPPORTED_LANGUAGES.find(lang => lang.code === browserLang);
      if (found) {
        setCurrentLanguage(found);
      }
    }
  }, []);

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('vitashifa-language', language.code);
    document.documentElement.lang = language.code;
    document.documentElement.dir = ['ar', 'he', 'fa'].includes(language.code) ? 'rtl' : 'ltr';
  };

  const t = (key: string): string => {
    return translations[currentLanguage.code]?.[key] || translations.en[key] || key;
  };

  const isRTL = ['ar', 'he', 'fa'].includes(currentLanguage.code);

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};