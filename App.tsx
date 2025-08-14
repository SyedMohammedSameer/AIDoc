import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MedicalConsultation } from './components/MedicalConsultation';
import { ImageAnalysis } from './components/ImageAnalysis';
import { WellnessPlanning } from './components/WellnessPlanning';
import { EmergencyGuidance } from './components/EmergencyGuidance';
import { Alert } from './components/Alert';
import EnvDebug from './components/EnvDebug';
import { Heart } from 'lucide-react';
import { NAVIGATION_ITEMS } from './constants';
import { NavigationTab } from './types';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>(NavigationTab.DRUG_INFO);
  const [configStatus, setConfigStatus] = useState<{
    geminiConfigured: boolean;
    firebaseConfigured: boolean;
    errors: string[];
  }>({
    geminiConfigured: false,
    firebaseConfigured: false,
    errors: []
  });
  
  const { t } = useLanguage();

  useEffect(() => {
    // Check configuration status
    const errors: string[] = [];
    
    // Check Gemini API key
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const geminiConfigured = !!(geminiKey && geminiKey !== "your_gemini_api_key_here" && geminiKey.length > 10);
    
    if (!geminiConfigured) {
      if (!geminiKey) {
        errors.push("VITE_GEMINI_API_KEY is not set in your .env file");
      } else if (geminiKey === "your_gemini_api_key_here") {
        errors.push("Please replace the placeholder Gemini API key with your actual key");
      } else if (geminiKey.length <= 10) {
        errors.push("Gemini API key appears to be invalid (too short)");
      }
    }
    
    // Check Firebase configuration
    const firebaseKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const firebaseProject = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    const firebaseConfigured = !!(firebaseKey && firebaseProject);
    
    if (!firebaseConfigured) {
      console.warn("Firebase not fully configured - data logging will be disabled");
    }
    
    setConfigStatus({
      geminiConfigured,
      firebaseConfigured,
      errors
    });
    
    // Log configuration status
    console.log('🔧 Configuration Status:', {
      gemini: geminiConfigured ? '✅' : '❌',
      firebase: firebaseConfigured ? '✅' : '⚠️',
      errors: errors.length
    });
  }, []);

  const renderActiveTab = () => {
    switch (activeTab) {
      case NavigationTab.DRUG_INFO:
        return <MedicalConsultation />;
      case NavigationTab.IMAGE_ANALYSIS:
        return <ImageAnalysis />;
      case NavigationTab.HEALTH_MANAGEMENT:
        return <WellnessPlanning />;
      case NavigationTab.EMERGENCY_AID:
        return <EmergencyGuidance />;
      default:
        return <MedicalConsultation />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-teal-900 dark:to-blue-900 transition-colors duration-300">
      <Navbar 
        activeTab={activeTab} 
        onNavSelect={setActiveTab} 
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* Configuration Errors */}
        {configStatus.errors.length > 0 && (
          <div className="mb-6">
            <Alert
              type="error"
              title="Configuration Issues"
              message={
                <div>
                  <p className="mb-2">Please fix these configuration issues:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {configStatus.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                  <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                    <p className="font-semibold mb-1">Quick Fix:</p>
                    <p>1. Check your .env file is in the root directory</p>
                    <p>2. Ensure each variable is on a separate line</p>
                    <p>3. Restart your development server after changes</p>
                  </div>
                </div>
              }
            />
          </div>
        )}
        
        {/* Firebase Warning */}
        {!configStatus.firebaseConfigured && configStatus.geminiConfigured && (
          <div className="mb-6">
            <Alert
              type="warning"
              title="Firebase Not Configured"
              message="Firebase is not configured. The app will work, but consultation logging and analytics will be disabled."
            />
          </div>
        )}
        
        <div className="animate-fade-in">
          {renderActiveTab()}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 py-8 mt-16 transition-colors duration-300">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Heart className="w-5 h-5 text-teal-500" />
            <span className="font-semibold text-gray-700 dark:text-gray-300">{t('appTitle')}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('appTagline')}. {t('medicalDisclaimer')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            © 2025 {t('appTitle')}. Built with care for your health and wellbeing.
          </p>
        </div>
      </footer>
      
      {/* Environment Debug Component (Development only) */}
      <EnvDebug />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;