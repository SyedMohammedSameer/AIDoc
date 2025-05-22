
import React, { useState, useCallback, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DrugInfoQA } from './components/DrugInfoQA';
import { MedicalImageAnalysis } from './components/MedicalImageAnalysis';
import { HealthManagement } from './components/HealthManagement';
import { EmergencyFirstAid } from './components/EmergencyFirstAid';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Alert } from './components/Alert';
import { APP_TITLE, NAVIGATION_ITEMS } from './constants';
import { NavigationTab } from './types';
import type { NavItem } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>(NavigationTab.DRUG_INFO);
  const [isLoading, setIsLoading] = useState<boolean>(false); // This state is still managed
  const [isApiKeyMissing, setIsApiKeyMissing] = useState<boolean>(false);

  useEffect(() => {
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === "YOUR_API_KEY" || apiKey === "MISSING_API_KEY") {
      setIsApiKeyMissing(true);
      console.warn("API_KEY is not configured. Application functionality will be limited.");
    }
  }, []);

  const handleNavSelect = useCallback((tabId: NavigationTab) => {
    setActiveTab(tabId);
  }, []);

  const renderActiveTab = () => {
    // THE CRUCIAL CHANGE: We no longer unmount the active tab component based on App's isLoading state.
    // The individual tab components will handle their own internal loading display (e.g., spinner on button).
    // if (isLoading && !isApiKeyMissing) return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>;

    switch (activeTab) {
      case NavigationTab.DRUG_INFO:
        return <DrugInfoQA setIsLoading={setIsLoading} />;
      case NavigationTab.IMAGE_ANALYSIS:
        return <MedicalImageAnalysis setIsLoading={setIsLoading} />;
      case NavigationTab.HEALTH_MANAGEMENT:
        return <HealthManagement setIsLoading={setIsLoading} />;
      case NavigationTab.EMERGENCY_AID:
        return <EmergencyFirstAid setIsLoading={setIsLoading} />;
      default:
        return <DrugInfoQA setIsLoading={setIsLoading} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-lightbg">
      <Navbar title={APP_TITLE} navItems={NAVIGATION_ITEMS} activeTab={activeTab} onNavSelect={handleNavSelect} />
      <main className="flex-grow container mx-auto px-4 py-8">
        {isApiKeyMissing && (
          <Alert
            type="error"
            title="Configuration Error: API Key Missing"
            message={
              <>
                <p>The Gemini API Key is not configured for this application.</p>
                <p>Please ensure the <code>API_KEY</code> environment variable is set correctly for the application to function.</p>
                <p>Without a valid API key, all features requiring AI interaction will fail or be disabled.</p>
              </>
            }
            className="mb-6"
          />
        )}
        {/* Optional: A global, non-unmounting loading indicator could be placed here if desired, controlled by 'isLoading' */}
        {/* For example: {isLoading && <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50"><LoadingSpinner size="lg" /></div>} */}
        {renderActiveTab()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
