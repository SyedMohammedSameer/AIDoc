
import React from 'react';
import { NavigationTab } from '../types';
import type { NavItem } from '../types';

interface NavbarProps {
  title: string;
  navItems: NavItem[];
  activeTab: NavigationTab;
  onNavSelect: (tabId: NavigationTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ title, navItems, activeTab, onNavSelect }) => {
  return (
    <nav className="bg-primary shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-2xl font-bold text-white">{title}</span>
          </div>
          <div className="hidden md:flex space-x-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavSelect(item.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out
                  ${activeTab === item.id 
                    ? 'bg-white text-primary' 
                    : 'text-lighttext hover:bg-secondary hover:text-white'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          {/* Mobile menu button - can be implemented if needed */}
        </div>
      </div>
    </nav>
  );
};
    