import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MedicalConsultation } from './components/MedicalConsultation';
import { ImageAnalysis } from './components/ImageAnalysis';
import { WellnessPlanning } from './components/WellnessPlanning';
import { EmergencyGuidance } from './components/EmergencyGuidance';
import { Alert } from './components/Alert';
import { Heart } from 'lucide-react';
import { APP_TITLE, APP_TAGLINE, NAVIGATION_ITEMS } from './constants';
import { NavigationTab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>(NavigationTab.DRUG_INFO);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);

  useEffect(() => {
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const firebaseKey = import.meta.env.VITE_FIREBASE_API_KEY;
    
    if (!geminiKey || geminiKey === "your_gemini_api_key_here") {
      setIsApiKeyMissing(true);
    }
    
    if (!firebaseKey) {
      console.warn("Firebase not configured - data logging will be disabled");
    }
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-teal-900 dark:to-blue-900">
      <Navbar 
        title={APP_TITLE}
        tagline={APP_TAGLINE}
        navItems={NAVIGATION_ITEMS} 
        activeTab={activeTab} 
        onNavSelect={setActiveTab} 
      />
      
      <main className="container mx-auto px-4 py-8">
        {isApiKeyMissing && (
          <div className="mb-6">
            <Alert
              type="error"
              title="Configuration Required"
              message="Please configure your GEMINI_API_KEY in the environment variables to use VitaShifa's AI features."
            />
          </div>
        )}
        
        <div className="animate-fade-in">
          {renderActiveTab()}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 py-8 mt-16">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Heart className="w-5 h-5 text-teal-500" />
            <span className="font-semibold text-gray-700 dark:text-gray-300">VitaShifa</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Your AI-powered health companion. Providing medical information, wellness guidance, and emergency assistance.
            Always consult healthcare professionals for medical decisions.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            © 2025 VitaShifa. Built with care for your health and wellbeing.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;