// components/Auth/UserMenu.tsx
import React, { useState } from 'react';
import { User, LogOut, History, ChevronDown } from 'lucide-react';
import { firebaseService } from '../../services/firebaseService';
import { useLanguage } from '../../contexts/LanguageContext';

interface UserMenuProps {
  user: any;
  onSignOut: () => void;
  onShowHistory: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, onSignOut, onShowHistory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  const handleSignOut = async () => {
    await firebaseService.signOut();
    onSignOut();
    setIsOpen(false);
  };

  const displayName = user?.displayName || user?.email || 'Anonymous User';
  const isAnonymous = !user?.email;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center shadow-sm">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="hidden sm:block text-start">
          <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {displayName}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {isAnonymous ? t('guestUser') : t('signedIn')}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="absolute end-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="font-medium text-gray-800 dark:text-gray-200 truncate">{displayName}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {isAnonymous ? 'Guest Session' : user?.email}
              </div>
            </div>

            <div className="py-1">
              <button
                onClick={() => {
                  onShowHistory();
                  setIsOpen(false);
                }}
                className="w-full text-start px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
              >
                <History className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span>{t('chatHistory')}</span>
              </button>

              <button
                onClick={handleSignOut}
                className="w-full text-start px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
              >
                <LogOut className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span>{t('signOut')}</span>
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