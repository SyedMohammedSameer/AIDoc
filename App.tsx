import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MedicalConsultation } from './components/MedicalConsultation';
import { ImageAnalysis } from './components/ImageAnalysis';
import { WellnessPlanning } from './components/WellnessPlanning';
import { EmergencyGuidance } from './components/EmergencyGuidance';
import { AuthModal } from './components/Auth/AuthModal';
import { UserMenu } from './components/Auth/UserMenu';
import { ChatHistory } from './components/ChatHistory';
import { FirebaseDebug } from './components/FirebaseDebug';
import { Alert } from './components/Alert';
import { Heart, User } from 'lucide-react';
import { NAVIGATION_ITEMS } from './constants';
import { NavigationTab } from './types';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { firebaseService, type ChatData } from './services/firebase';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>(NavigationTab.DRUG_INFO);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!geminiKey || geminiKey === "your_gemini_api_key_here") {
      setIsApiKeyMissing(true);
    }

    // Add debug function to window for console access
    (window as any).debugVitaShifa = () => {
      console.log("=== VITASHIFA DEBUG INFO ===");
      console.log("Firebase API Key:", import.meta.env.VITE_FIREBASE_API_KEY ? "✅ SET" : "❌ MISSING");
      console.log("Firebase Auth Domain:", import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "❌ MISSING");
      console.log("Firebase Project ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID || "❌ MISSING");
      console.log("Firebase App ID:", import.meta.env.VITE_FIREBASE_APP_ID ? "✅ SET" : "❌ MISSING");
      console.log("Gemini API Key:", import.meta.env.VITE_GEMINI_API_KEY ? "✅ SET" : "❌ MISSING");
      
      console.log("\n=== FIREBASE SERVICE STATUS ===");
      console.log("Firebase Enabled:", firebaseService.isEnabled());
      console.log("Current User:", firebaseService.getCurrentUser()?.email || "None");
      
      console.log("\n=== PARTIAL VALUES ===");
      if (import.meta.env.VITE_FIREBASE_API_KEY) {
        console.log("API Key starts with:", import.meta.env.VITE_FIREBASE_API_KEY.substring(0, 10) + "...");
      }
      if (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) {
        console.log("Auth Domain:", import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
      }
      if (import.meta.env.VITE_FIREBASE_PROJECT_ID) {
        console.log("Project ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID);
      }
      
      return "Debug info printed above ☝️";
    };

    // Initialize Firebase and check for existing user
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      await firebaseService.initialize();
      
      // Check if user is already signed in (from previous session)
      const currentUser = firebaseService.getCurrentUser();
      if (currentUser) {
        console.log('Found existing user session:', currentUser.email || 'Anonymous');
        setUser(currentUser);
      } else {
        console.log('No existing user session - showing auth options');
        // Don't auto-sign in anonymously - let user choose
        setIsAuthModalOpen(true);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // If Firebase fails, still show auth modal for offline mode
      setIsAuthModalOpen(true);
    } finally {
      setAuthInitialized(true);
    }
  };

  const handleAuthSuccess = (authenticatedUser: any) => {
    setUser(authenticatedUser);
    setIsAuthModalOpen(false);
  };

  const handleSignOut = () => {
    setUser(null);
    setIsAuthModalOpen(true); // Show auth modal again after sign out
  };

  const handleChatSelect = (chat: ChatData) => {
    setIsChatHistoryOpen(false);
    // Optionally navigate to the appropriate tab and populate the form
    setActiveTab(chat.type);
  };

  const renderActiveTab = () => {
    const commonProps = {
      user,
      onChatSaved: () => {
        // Optionally refresh chat history or show success message
      }
    };

    switch (activeTab) {
      case NavigationTab.DRUG_INFO:
        return <MedicalConsultation {...commonProps} />;
      case NavigationTab.IMAGE_ANALYSIS:
        return <ImageAnalysis {...commonProps} />;
      case NavigationTab.HEALTH_MANAGEMENT:
        return <WellnessPlanning {...commonProps} />;
      case NavigationTab.EMERGENCY_AID:
        return <EmergencyGuidance {...commonProps} />;
      default:
        return <MedicalConsultation {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-teal-900 dark:to-blue-900 transition-colors duration-300">
      {/* Enhanced Navbar with Auth */}
      <nav className="glass-effect sticky top-0 z-40 border-b border-white/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-teal-500 to-blue-600 p-2 rounded-xl">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  {t('appTitle')}
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t('appTagline')}</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {NAVIGATION_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    activeTab === item.id 
                      ? 'bg-teal-500 text-white shadow-lg transform scale-105' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <span className="text-lg">{item.icon === 'MessageCircle' ? '💬' : item.icon === 'Scan' ? '🔍' : item.icon === 'Heart' ? '❤️' : '🚨'}</span>
                  <span className="hidden xl:inline">{t(item.labelKey)}</span>
                </button>
              ))}
            </div>

            {/* User Menu or Sign In Button */}
            <div className="flex items-center space-x-3">
              {authInitialized && user ? (
                <UserMenu 
                  user={user}
                  onSignOut={handleSignOut}
                  onShowHistory={() => setIsChatHistoryOpen(true)}
                />
              ) : authInitialized ? (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              ) : (
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {!authInitialized ? (
          // Loading state while initializing auth
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                Initializing VitaShifa...
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Setting up your AI health companion
              </p>
            </div>
          </div>
        ) : !user ? (
          // Welcome screen when no user is authenticated
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center space-y-6 max-w-2xl">
              <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Welcome to VitaShifa
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  Your AI-Powered Health Companion
                </p>
                <p className="text-gray-500 dark:text-gray-500">
                  Get expert medical guidance, analyze medical images, create wellness plans, and access emergency care assistance.
                </p>
              </div>
              
              {/* Debug Info */}
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-sm">
                <div className="font-medium mb-2">System Status:</div>
                <div className="space-y-1 text-left">
                  <div className="flex justify-between">
                    <span>Firebase:</span>
                    <span className={firebaseService.isEnabled() ? 'text-green-600' : 'text-red-600'}>
                      {firebaseService.isEnabled() ? '✅ Connected' : '❌ Not Available'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gemini AI:</span>
                    <span className={!isApiKeyMissing ? 'text-green-600' : 'text-red-600'}>
                      {!isApiKeyMissing ? '✅ Ready' : '❌ Not Configured'}
                    </span>
                  </div>
                </div>
                
                {!firebaseService.isEnabled() && (
                  <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded text-yellow-800 dark:text-yellow-200 text-xs">
                    💡 Run <code>debugVitaShifa()</code> in console for details
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
                >
                  Get Started
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Sign up for free or continue as guest
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
      </main>
      
      {/* Footer */}
      <footer className="mt-auto bg-white/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 py-8 transition-colors duration-300">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Heart className="w-5 h-5 text-teal-500" />
            <span className="font-semibold text-gray-700 dark:text-gray-300">{t('appTitle')}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('appTagline')}. {t('medicalDisclaimer')}
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
            <span>© 2025 {t('appTitle')}</span>
            {user && (
              <span>
                {firebaseService.isEnabled() ? '☁️ Cloud Sync' : '💾 Local Storage'}
              </span>
            )}
            <span>Built with care for your health</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <ChatHistory
        isOpen={isChatHistoryOpen}
        onClose={() => setIsChatHistoryOpen(false)}
        onChatSelect={handleChatSelect}
      />
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