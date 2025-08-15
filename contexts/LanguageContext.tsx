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
    appTitle: 'VitaShifa',
    appTagline: 'Your AI-Powered Health Companion',
    medicalConsultation: 'Medical Consultation',
    medicalConsultationDesc: 'Get expert medical guidance and drug information',
    aiDiagnosis: 'AI Diagnosis',
    aiDiagnosisDesc: 'Analyze medical images with AI precision',
    wellnessPlanning: 'Wellness Planning',
    wellnessPlanningDesc: 'Personalized health and wellness strategies',
    emergencyCare: 'Emergency Care',
    emergencyCareDesc: 'Immediate first aid and emergency guidance',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    guestUser: 'Guest User',
    signedIn: 'Signed In',
    chatHistory: 'Chat History',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    system: 'System',
    medicalDisclaimer: 'This AI consultation is for informational purposes only and does not replace professional medical advice. Always consult with healthcare providers for medical concerns.',
    welcomeTo: 'Welcome to VitaShifa',
    getStarted: 'Get Started',
    continueAsGuest: 'Continue as Guest',
    signUpFree: 'Sign up for free or continue as guest',
    initializing: 'Initializing VitaShifa...',
    settingUp: 'Setting up your AI health companion',
    welcomeMessage: 'Get expert medical guidance, analyze medical images, create wellness plans, and access emergency care assistance.',
    systemStatus: 'System Status:',
    supabase: 'Supabase:',
    geminiAi: 'Gemini AI:',
    connected: '✅ Connected',
    notAvailable: '❌ Not Available',
    ready: '✅ Ready',
    notConfigured: '❌ Not Configured',
    debugInstructions: '💡 Run debugVitaShifa() in console for details',
    builtWithCare: 'Built with care for your health',
    cloudSync: '☁️ Cloud Sync',
    localStorage: '💾 Local Storage',
  },
  es: {
    appTitle: 'VitaShifa',
    appTagline: 'Tu Compañero de Salud Impulsado por IA',
    medicalConsultation: 'Consulta Médica',
    medicalConsultationDesc: 'Obtén orientación médica experta e información sobre medicamentos',
    aiDiagnosis: 'Diagnóstico por IA',
    aiDiagnosisDesc: 'Analiza imágenes médicas con precisión de IA',
    wellnessPlanning: 'Planificación de Bienestar',
    wellnessPlanningDesc: 'Estrategias personalizadas de salud y bienestar',
    emergencyCare: 'Atención de Emergencia',
    emergencyCareDesc: 'Primeros auxilios inmediatos y orientación de emergencia',
    signIn: 'Iniciar Sesión',
    signOut: 'Cerrar Sesión',
    guestUser: 'Usuario Invitado',
    signedIn: 'Sesión Iniciada',
    chatHistory: 'Historial de Chat',
    lightMode: 'Modo Claro',
    darkMode: 'Modo Oscuro',
    system: 'Sistema',
    medicalDisclaimer: 'Esta consulta de IA es solo para fines informativos y no reemplaza el consejo médico profesional. Siempre consulte a los proveedores de atención médica para inquietudes médicas.',
    welcomeTo: 'Bienvenido a VitaShifa',
    getStarted: 'Empezar',
    continueAsGuest: 'Continuar como invitado',
    signUpFree: 'Regístrese gratis o continúe como invitado',
    initializing: 'Inicializando VitaShifa...',
    settingUp: 'Configurando su compañero de salud de IA',
    welcomeMessage: 'Obtenga orientación médica experta, analice imágenes médicas, cree planes de bienestar y acceda a asistencia de atención de emergencia.',
    systemStatus: 'Estado del Sistema:',
    supabase: 'Supabase:',
    geminiAi: 'IA de Gemini:',
    connected: '✅ Conectado',
    notAvailable: '❌ No Disponible',
    ready: '✅ Listo',
    notConfigured: '❌ No Configurado',
    debugInstructions: '💡 Ejecute debugVitaShifa() en la consola para más detalles',
    builtWithCare: 'Construido con cuidado para su salud',
    cloudSync: '☁️ Sincronización en la Nube',
    localStorage: '💾 Almacenamiento Local',
  },
  // Add other languages here...
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
    const savedLanguage = localStorage.getItem('vitashifa-language');
    if (savedLanguage) {
      const found = SUPPORTED_LANGUAGES.find(lang => lang.code === savedLanguage);
      if (found) {
        setCurrentLanguage(found);
      }
    } else {
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