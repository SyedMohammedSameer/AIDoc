import React, { useState } from 'react';
import { X, Mail, Lock, User, LogIn, UserPlus, Bug } from 'lucide-react';
import { supabaseService } from '../../services/supabase';
import { LoadingSpinner } from '../LoadingSpinner';
import { Alert } from '../Alert';
import { useLanguage } from '../../contexts/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

type AuthMode = 'signin' | 'signup';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      let user;
      if (mode === 'signup') {
        user = await supabaseService.signUpWithEmail(email, password, displayName);
      } else {
        user = await supabaseService.signInWithEmail(email, password);
      }
      await supabaseService.createUserProfile(user);
      await supabaseService.syncLocalDataToSupabase();
      onAuthSuccess(user);
      handleClose();
    } catch (err: any) {
      const errorMessage = err.code ? getSupabaseErrorMessage(err.code) : `Authentication failed: ${err.message || 'Unknown error'}`;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getSupabaseErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'invalid_credentials': return 'Invalid email or password.';
      case 'email_already_in_use': case 'user_already_exists': return 'An account with this email already exists.';
      case 'weak_password': return 'Password should be at least 6 characters.';
      case 'invalid_email': return 'Please enter a valid email address.';
      case 'signup_disabled': return 'New user signups are currently disabled.';
      case 'too_many_requests': return 'Too many requests. Please try again later.';
      case 'network_request_failed': return 'Network error. Please check your connection and try again.';
      case 'invalid_api_key': return 'Invalid API key configuration. Please contact support.';
      case 'unexpected_failure': return 'An unexpected error occurred. Please check the console for details and ensure your Supabase backend is configured correctly.';
      default: return `Authentication error (${errorCode}). Please try again or contact support.`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md relative">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('welcomeTo')}</h2>
            <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Sign in to access VitaShifa's AI health features and save your consultation history</p>
        </div>
        
        <div className="p-6">
          {error && (<Alert type="error" message={error} className="mb-4" />)}
          
          <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1 mb-6">
            <button 
              onClick={() => setMode('signin')} 
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${ 
                mode === 'signin' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400' 
              }`}
            >
              {t('signIn')}
            </button>
            <button 
              onClick={() => setMode('signup')} 
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${ 
                mode === 'signup' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400' 
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute start-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    id="displayName" 
                    type="text" 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)} 
                    className="w-full ps-10 pe-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white" 
                    placeholder="Enter your full name" 
                    required 
                  />
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full ps-10 pe-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white" 
                  placeholder="Enter your email" 
                  required 
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full ps-10 pe-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white" 
                  placeholder="Enter your password" 
                  minLength={6} 
                  required 
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2 rtl:space-x-reverse"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" className="text-white" />
              ) : (
                <>
                  {mode === 'signin' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  <span>{mode === 'signin' ? t('signIn') : 'Create Account'}</span>
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center space-y-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
            <button 
              onClick={() => supabaseService.debugConfig()} 
              className="inline-flex items-center space-x-1 rtl:space-x-reverse text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <Bug className="w-3 h-3" />
              <span>Debug Supabase Config</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};