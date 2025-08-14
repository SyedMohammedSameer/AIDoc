// components/Auth/UserMenu.tsx
import React, { useState } from 'react';
import { User, LogOut, History, Settings, ChevronDown } from 'lucide-react';
import { supabaseService } from '../../services/supabase';

interface UserMenuProps {
  user: any;
  onSignOut: () => void;
  onShowHistory: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, onSignOut, onShowHistory }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await supabaseService.signOut();
    onSignOut();
    setIsOpen(false);
  };

  const displayName = user?.displayName || user?.email || 'Anonymous User';
  const isAnonymous = user?.isAnonymous;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {displayName}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {isAnonymous ? 'Guest User' : 'Signed In'}
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="font-medium text-gray-900 dark:text-white">{displayName}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {isAnonymous ? 'Guest Session' : user?.email}
              </div>
            </div>
            
            <div className="py-1">
              <button
                onClick={() => {
                  onShowHistory();
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
              >
                <History className="w-4 h-4" />
                <span>Chat History</span>
              </button>
              
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
          
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
    </div>
  );
};