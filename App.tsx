import React, { useState, useEffect } from 'react';
import { MedicalConsultation } from './components/MedicalConsultation';
import { ImageAnalysis } from './components/ImageAnalysis';
import { WellnessPlanning } from './components/WellnessPlanning';
import { EmergencyGuidance } from './components/EmergencyGuidance';
import { AuthModal } from './components/Auth/AuthModal';
import { UserMenu } from './components/Auth/UserMenu';
import { ChatHistory } from './components/ChatHistory';

import { Alert } from './components/Alert';
import { Heart, User, ChevronDown, Globe, Sun, Moon, Monitor, LogIn } from 'lucide-react';
import { NAVIGATION_ITEMS } from './constants';
import { NavigationTab } from './types';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage, SUPPORTED_LANGUAGES } from './contexts/LanguageContext';
import { supabaseService, type ChatData } from './services/supabase';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>(NavigationTab.DRUG_INFO);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const { t, currentLanguage, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!geminiKey || geminiKey === "your_gemini_api_key_here") {
      setIsApiKeyMissing(true);
    }

    (window as any).debugVitaShifa = () => {
      console.log("=== VITASHIFA DEBUG INFO ===");
      console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL ? "✅ SET" : "❌ MISSING");
      console.log("Supabase Anon Key:", import.meta.env.VITE_SUPABASE_ANON_KEY ? "✅ SET" : "❌ MISSING");
      console.log("Gemini API Key:", import.meta.env.VITE_GEMINI_API_KEY ? "✅ SET" : "❌ MISSING");
      console.log("\n=== SUPABASE SERVICE STATUS ===");
      console.log("Supabase Enabled:", supabaseService.isEnabled());
      console.log("Current User:", supabaseService.getCurrentUser()?.email || "None");
    };

    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      await supabaseService.initialize();
      const currentUser = supabaseService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      } else {
        setIsAuthModalOpen(true);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
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
    setIsAuthModalOpen(true);
  };

  const handleChatSelect = (chat: ChatData) => {
    setIsChatHistoryOpen(false);
    setActiveTab(chat.type);
  };

  const getThemeIcon = () => {
    switch(theme) {
      case 'light': return <Sun className="h-4 w-4" />;
      case 'dark': return <Moon className="h-4 w-4" />;
      case 'system': return <Monitor className="h-4 w-4" />;
    }
  };

  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'MessageCircle': return '💬';
      case 'Scan': return '🔍';
      case 'Heart': return '❤️';
      case 'AlertTriangle': return '🚨';
      default: return '📋';
    }
  };

  const renderActiveTab = () => {
    const commonProps = { user, onChatSaved: () => {} };
    switch (activeTab) {
      case NavigationTab.DRUG_INFO: return <MedicalConsultation {...commonProps} />;
      case NavigationTab.IMAGE_ANALYSIS: return <ImageAnalysis {...commonProps} />;
      case NavigationTab.HEALTH_MANAGEMENT: return <WellnessPlanning {...commonProps} />;
      case NavigationTab.EMERGENCY_AID: return <EmergencyGuidance {...commonProps} />;
      default: return <MedicalConsultation {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-teal-900 dark:to-blue-900 transition-colors duration-300">
      <nav className="glass-effect sticky top-0 z-40 border-b border-white/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="bg-gradient-to-r from-teal-500 to-blue-600 p-2 rounded-xl">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">{t('appTitle')}</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t('appTagline')}</p>
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-1 rtl:space-x-reverse">
              {NAVIGATION_ITEMS.map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 rtl:space-x-reverse ${ activeTab === item.id ? 'bg-teal-500 text-white shadow-lg transform scale-105' : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50' }`}>
                  <span className="text-lg">{getIcon(item.icon)}</span>
                  <span className="hidden xl:inline">{t(item.labelKey)}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="relative">
                <button onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)} className="flex items-center space-x-2 rtl:space-x-reverse p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                  <Globe className="h-4 w-4" /><span className="text-lg">{currentLanguage.flag}</span><ChevronDown className="h-3 w-3" />
                </button>
                {isLanguageMenuOpen && (
                  <div className="absolute end-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-80 overflow-y-auto z-50">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button key={lang.code} onClick={() => { setLanguage(lang); setIsLanguageMenuOpen(false); }} className={`w-full text-start px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 rtl:space-x-reverse ${ currentLanguage.code === lang.code ? 'bg-teal-50 dark:bg-teal-900/30' : '' }`}>
                        <span className="text-lg">{lang.flag}</span>
                        <div>
                          <div className="font-medium">{lang.nativeName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{lang.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <button onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)} className="flex items-center space-x-2 rtl:space-x-reverse p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                  {getThemeIcon()}<ChevronDown className="h-3 w-3" />
                </button>
                {isThemeMenuOpen && (
                  <div className="absolute end-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                    {[{ key: 'light', icon: <Sun className="h-4 w-4" />, label: t('lightMode') }, { key: 'dark', icon: <Moon className="h-4 w-4" />, label: t('darkMode') }, { key: 'system', icon: <Monitor className="h-4 w-4" />, label: t('system') }].map((themeOption) => (
                      <button key={themeOption.key} onClick={() => { setTheme(themeOption.key as any); setIsThemeMenuOpen(false); }} className={`w-full text-start px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 rtl:space-x-reverse ${ theme === themeOption.key ? 'bg-teal-50 dark:bg-teal-900/30' : '' }`}>
                        {themeOption.icon}<span>{themeOption.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {authInitialized && user ? (
                <UserMenu user={user} onSignOut={handleSignOut} onShowHistory={() => setIsChatHistoryOpen(true)} />
              ) : authInitialized ? (
                <button onClick={() => setIsAuthModalOpen(true)} className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                  <LogIn className="w-4 h-4" /><span className="hidden sm:inline">{t('signIn')}</span>
                </button>
              ) : (<div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>)}
            </div>
          </div>
        </div>
        {(isLanguageMenuOpen || isThemeMenuOpen) && (<div className="fixed inset-0 z-30" onClick={() => { setIsLanguageMenuOpen(false); setIsThemeMenuOpen(false); }} />)}
      </nav>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {!authInitialized ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full flex items-center justify-center mx-auto"><Heart className="w-8 h-8 text-white animate-pulse" /></div>
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">{t('initializing')}</h2>
              <p className="text-gray-500 dark:text-gray-400">{t('settingUp')}</p>
            </div>
          </div>
        ) : !user ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center space-y-6 max-w-2xl">
              <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full flex items-center justify-center mx-auto"><Heart className="w-10 h-10 text-white" /></div>
              <div className="space-y-3">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">{t('welcomeTo')}</h1>
                <p className="text-xl text-gray-600 dark:text-gray-400">{t('appTagline')}</p>
                <p className="text-gray-500 dark:text-gray-500">{t('welcomeMessage')}</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-sm">
                <div className="font-medium mb-2">{t('systemStatus')}</div>
                <div className="space-y-1 text-start">
                  <div className="flex justify-between"><span>{t('supabase')}</span><span className={supabaseService.isEnabled() ? 'text-green-600' : 'text-red-600'}>{supabaseService.isEnabled() ? t('connected') : t('notAvailable')}</span></div>
                  <div className="flex justify-between"><span>{t('geminiAi')}</span><span className={!isApiKeyMissing ? 'text-green-600' : 'text-red-600'}>{!isApiKeyMissing ? t('ready') : t('notConfigured')}</span></div>
                </div>
                {!supabaseService.isEnabled() && (<div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded text-yellow-800 dark:text-yellow-200 text-xs">{t('debugInstructions')}</div>)}
              </div>
              <div className="space-y-4">
                <button onClick={() => setIsAuthModalOpen(true)} className="bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg">{t('getStarted')}</button>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('signUpFree')}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {isApiKeyMissing && (<div className="mb-6"><Alert type="error" title="Configuration Required" message="Please configure your GEMINI_API_KEY in the environment variables to use VitaShifa's AI features." /></div>)}
            <div className="animate-fade-in">{renderActiveTab()}</div>
          </>
        )}
      </main>
      
      <footer className="mt-auto bg-white/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 py-8 transition-colors duration-300">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse"><Heart className="w-5 h-5 text-teal-500" /><span className="font-semibold text-gray-700 dark:text-gray-300">{t('appTitle')}</span></div>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{t('appTagline')}. {t('medicalDisclaimer')}</p>
          <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse text-xs text-gray-500 dark:text-gray-500">
            <span>© 2025 {t('appTitle')}</span>
            {user && (<span>{supabaseService.isEnabled() ? t('cloudSync') : t('localStorage')}</span>)}
            <span>{t('builtWithCare')}</span>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onAuthSuccess={handleAuthSuccess} />
      <ChatHistory isOpen={isChatHistoryOpen} onClose={() => setIsChatHistoryOpen(false)} onChatSelect={handleChatSelect} />
    </div>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  </ThemeProvider>
);

export default App;