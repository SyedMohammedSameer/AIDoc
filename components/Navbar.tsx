import React, { useState } from 'react';
import { Menu, X, Moon, Sun, Heart } from 'lucide-react';
import { NavigationTab } from '../types';
import type { NavItem } from '../types';

interface NavbarProps {
  title: string;
  tagline: string;
  navItems: NavItem[];
  activeTab: NavigationTab;
  onNavSelect: (tabId: NavigationTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ title, tagline, navItems, activeTab, onNavSelect }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
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

  return (
    <nav className="glass-effect sticky top-0 z-50 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-teal-500 to-blue-600 p-2 rounded-xl">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                {title}
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">{tagline}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
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
                <span className="hidden xl:inline">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
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
            {navItems.map((item) => (
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
                  <div>{item.label}</div>
                  <div className="text-xs opacity-75">{item.description}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};