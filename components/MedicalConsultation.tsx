import React, { useState } from 'react';
import { Send, Bot } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { firebaseService } from '../services/firebase';
import { LoadingSpinner } from './LoadingSpinner';
import { ResponseFormatter } from './ResponseFormatter';
import { Alert } from './Alert';
import { useLanguage } from '../contexts/LanguageContext';
import { NavigationTab } from '../types';
import type { FormattedResponse } from '../types';

interface MedicalConsultationProps {
  user?: any;
  onChatSaved?: () => void;
}

export const MedicalConsultation: React.FC<MedicalConsultationProps> = ({ user, onChatSaved }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<FormattedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResponse(null);
    setSaveStatus('idle');

    try {
      const result = await geminiService.getMedicalConsultation(query);
      if (result.response.text.startsWith('API Error:')) {
        setError(result.response.text);
      } else {
        setResponse(result.formatted);
        
        // Save to Firebase/localStorage
        setSaveStatus('saving');
        try {
          await firebaseService.saveChat(
            NavigationTab.DRUG_INFO,
            query,
            result.formatted
          );
          setSaveStatus('saved');
          onChatSaved?.();
          
          // Auto-hide save status after 3 seconds
          setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (saveError) {
          console.error('Failed to save chat:', saveError);
          setSaveStatus('error');
        }
      }
    } catch (err) {
      setError('Failed to get consultation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSaveStatusMessage = () => {
    switch (saveStatus) {
      case 'saving':
        return { type: 'info' as const, message: 'Saving consultation...' };
      case 'saved':
        return { 
          type: 'success' as const, 
          message: firebaseService.isEnabled() ? 'Consultation saved to your history' : 'Consultation saved locally'
        };
      case 'error':
        return { type: 'warning' as const, message: 'Saved locally only - cloud sync failed' };
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white px-4 py-2 rounded-full">
          <Bot className="w-5 h-5" />
          <span className="font-medium">{t('medicalConsultation')}</span>
        </div>
        <p className="text-gray-600 dark:text-gray-400">{t('medicalConsultationDesc')}</p>
      </div>

      {/* Disclaimer */}
      <Alert 
        type="info" 
        title="Medical Disclaimer"
        message={t('medicalDisclaimer')}
      />

      {/* Save Status */}
      {getSaveStatusMessage() && (
        <Alert 
          type={getSaveStatusMessage()!.type}
          message={getSaveStatusMessage()!.message}
        />
      )}

      {/* Input Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-colors duration-300">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="consultation-query" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('askAbout')}
            </label>
            <textarea
              id="consultation-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('consultationPlaceholder')}
              rows={4}
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white resize-none transition-all bg-white"
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" className="text-white" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>{t('getConsultation')}</span>
              </>
            )}
          </button>
        </form>

        {/* User Context Info */}
        {user && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💾 Signed in as <strong>{user.displayName || user.email || 'Anonymous'}</strong> - 
              Your consultations will be {firebaseService.isEnabled() ? 'saved to your cloud history' : 'saved locally'}
            </p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <Alert type="error" title="Consultation Error" message={error} />
      )}

      {/* Response */}
      {response && (
        <div className="animate-slide-up">
          <ResponseFormatter response={response} />
        </div>
      )}
    </div>
  );
};