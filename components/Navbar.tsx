import React, { useState } from 'react';
import { Menu, X, Moon, Sun, Monitor, Globe, Heart, ChevronDown } from 'lucide-react';
import { NavigationTab } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '../contexts/LanguageContext';
import { NAVIGATION_ITEMS } from '../constants';

interface NavbarProps {
  activeTab: NavigationTab;
  onNavSelect: (tabId: NavigationTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onNavSelect }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  
  const { theme, setTheme, isDark } = useTheme();
  const { currentLanguage, setLanguage, t } = useLanguage();

  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'MessageCircle': return '💬';
      case 'Scan': return '🔍';
      case 'Heart': return '❤️';
      case 'AlertTriangle': return '🚨';
      default: return '📋';
    }
  };

  const getThemeIcon = () => {
    switch(theme) {
      case 'light': return <Sun className="h-4 w-4" />;
      case 'dark': return <Moon className="h-4 w-4" />;
      case 'system': return <Monitor className="h-4 w-4" />;
    }
  };

  const getThemeLabel = () => {
    switch(theme) {
      case 'light': return t('lightMode');
      case 'dark': return t('darkMode');
      case 'system': return 'System';
    }
  };

  return (
    <nav className="glass-effect sticky top-0 z-50 border-b border-white/20 backdrop-blur-md">
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
                onClick={() => onNavSelect(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === item.id 
                    ? 'bg-teal-500 text-white shadow-lg transform scale-105' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
                }`}
              >
                <span className="text-lg">{getIcon(item.icon)}</span>
                <span className="hidden xl:inline">{t(item.labelKey)}</span>
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span className="text-lg">{currentLanguage.flag}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              
              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-80 overflow-y-auto z-50">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang);
                        setIsLanguageMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 ${
                        currentLanguage.code === lang.code ? 'bg-teal-50 dark:bg-teal-900/30' : ''
                      }`}
                    >
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

            {/* Theme Selector */}
            <div className="relative">
              <button
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
              >
                {getThemeIcon()}
                <ChevronDown className="h-3 w-3" />
              </button>
              
              {isThemeMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                  {[
                    { key: 'light', icon: <Sun className="h-4 w-4" />, label: t('lightMode') },
                    { key: 'dark', icon: <Moon className="h-4 w-4" />, label: t('darkMode') },
                    { key: 'system', icon: <Monitor className="h-4 w-4" />, label: 'System' }
                  ].map((themeOption) => (
                    <button
                      key={themeOption.key}
                      onClick={() => {
                        setTheme(themeOption.key as any);
                        setIsThemeMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 ${
                        theme === themeOption.key ? 'bg-teal-50 dark:bg-teal-900/30' : ''
                      }`}
                    >
                      {themeOption.icon}
                      <span>{themeOption.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden pb-4 pt-2 space-y-1 animate-slide-up">
            {NAVIGATION_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavSelect(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-3 ${
                  activeTab === item.id 
                    ? 'bg-teal-500 text-white' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
                }`}
              >
                <span className="text-xl">{getIcon(item.icon)}</span>
                <div>
                  <div>{t(item.labelKey)}</div>
                  <div className="text-xs opacity-75">{t(item.descriptionKey)}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Click outside to close dropdowns */}
      {(isLanguageMenuOpen || isThemeMenuOpen) && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsLanguageMenuOpen(false);
            setIsThemeMenuOpen(false);
          }}
        />
      )}
    </nav>
  );
};