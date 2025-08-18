// components/Auth/AuthModal.tsx
import React, { useState } from 'react';
import { X, Lock, User, LogIn, UserPlus, Bug, AlertTriangle } from 'lucide-react';
import { firebaseService } from '../../services/firebaseService';
import { LoadingSpinner } from '../LoadingSpinner';
import { Alert } from '../Alert';
import { EnhancedEmailInput } from '../EnhancedEmailInput';
import { EmailValidator, type EmailValidationResult } from '../../utils/emailValidation';
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
  const [emailValidation, setEmailValidation] = useState<EmailValidationResult | null>(null);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const { t } = useLanguage();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError(null);
    setEmailValidation(null);
    setIsEmailValid(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleEmailChange = (value: string, isValid: boolean) => {
    setEmail(value);
    setIsEmailValid(isValid);
    setError(null); // Clear previous errors when user starts typing
  };

  const handleEmailValidationChange = (validation: EmailValidationResult | null) => {
    setEmailValidation(validation);
  };

  const validateFormBeforeSubmit = (): boolean => {
    if (!email.trim()) {
      setError('Email address is required');
      return false;
    }

    if (!isEmailValid || !emailValidation?.isValid) {
      setError('Please enter a valid email address before continuing');
      return false;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (mode === 'signup' && !displayName.trim()) {
      setError('Full name is required for account creation');
      return false;
    }

    return true;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFormBeforeSubmit()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let user;
      if (mode === 'signup') {
        user = await firebaseService.signUpWithEmail(email, password, displayName);
      } else {
        user = await firebaseService.signInWithEmail(email, password);
      }

      if (user) {
        onAuthSuccess(user);
        handleClose();
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };


  if (!isOpen) return null;

  const canSubmit = isEmailValid && password.length >= 6 && (mode === 'signin' || displayName.trim().length > 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md relative">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('welcomeTo')}</h2>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Sign in to access VitaShifa's AI health features and save your consultation history
          </p>
        </div>

        <div className="p-6">
          {error && (
            <Alert type="error" message={error} className="mb-4" />
          )}

          <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1 mb-6">
            <button
              onClick={() => {setMode('signin'); resetForm();}}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'signin'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {t('signIn')}
            </button>
            <button
              onClick={() => {setMode('signup'); resetForm();}}
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
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
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
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <EnhancedEmailInput
              value={email}
              onChange={handleEmailChange}
              onValidationChange={handleEmailValidationChange}
              placeholder="Enter your email address"
              required
              disabled={isLoading}
              showSuggestions={true}
              label="Email Address"
            />

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
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
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Minimum 6 characters required
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !canSubmit}
              className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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

        </div>
      </div>
    </div>
  );
};