import React, { useState } from 'react';
import { AlertTriangle, Phone, Clock } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { supabaseService } from '../services/supabase';
import { LoadingSpinner } from './LoadingSpinner';
import { ResponseFormatter } from './ResponseFormatter';
import { Alert } from './Alert';
import { useLanguage } from '../contexts/LanguageContext';
import { NavigationTab } from '../types';
import type { FormattedResponse } from '../types';

interface EmergencyGuidanceProps {
  user?: any;
  onChatSaved?: () => void;
}

export const EmergencyGuidance: React.FC<EmergencyGuidanceProps> = ({ user, onChatSaved }) => {
  const [situation, setSituation] = useState('');
  const [response, setResponse] = useState<FormattedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const { t, currentLanguage } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!situation.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    setResponse(null);
    setSaveStatus('idle');
    try {
      const result = await geminiService.getEmergencyGuidance(situation, currentLanguage.name);
      if (result.response.text.startsWith('API Error:')) {
        setError(result.response.text);
      } else {
        setResponse(result.formatted);
        setSaveStatus('saving');
        try {
          await supabaseService.saveChat(NavigationTab.EMERGENCY_AID, situation, result.formatted);
          setSaveStatus('saved');
          onChatSaved?.();
          setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (saveError) {
          console.error('Failed to save chat:', saveError);
          setSaveStatus('error');
        }
      }
    } catch (err) {
      setError('Failed to get emergency guidance. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSaveStatusMessage = () => {
    switch (saveStatus) {
      case 'saving': return { type: 'info' as const, message: 'Saving emergency guidance...' };
      case 'saved': return { type: 'success' as const, message: supabaseService.isEnabled() ? 'Emergency guidance saved to your history' : 'Emergency guidance saved locally' };
      case 'error': return { type: 'warning' as const, message: 'Saved locally only - cloud sync failed' };
      default: return null;
    }
  };

  const emergencyNumbers = [
    { country: 'United States', number: '911' },
    { country: 'United Kingdom', number: '999' },
    { country: 'European Union', number: '112' },
    { country: 'Australia', number: '000' },
    { country: 'Canada', number: '911' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-gradient-to-r from-red-500 to-orange-600 text-white px-4 py-2 rounded-full">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">{t('emergencyTitle')}</span>
        </div>
        <p className="text-gray-600 dark:text-gray-400">{t('emergencyDesc')}</p>
      </div>

      <Alert type="error" title={t('lifeThreatening')} message={
        <div className="space-y-3">
          <p className="font-bold text-lg">{t('callEmergency')}</p>
          <p>{t('emergencyInfo')}</p>
          <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
            <p className="font-semibold mb-2 text-red-800 dark:text-red-200">Call these numbers for immediate help:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {emergencyNumbers.map((item, index) => (
                <div key={index} className="flex justify-between text-red-700 dark:text-red-300">
                  <span>{item.country}:</span>
                  <span className="font-bold">{item.number}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      } />

      {getSaveStatusMessage() && (<Alert type={getSaveStatusMessage()!.type} message={getSaveStatusMessage()!.message} />)}

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
          <Phone className="w-8 h-8 text-red-500 mb-2" /><h3 className="font-semibold text-red-800 dark:text-red-300">Call for Help</h3><p className="text-sm text-red-700 dark:text-red-400">Emergency services first, then family/friends</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
          <AlertTriangle className="w-8 h-8 text-yellow-500 mb-2" /><h3 className="font-semibold text-yellow-800 dark:text-yellow-300">Stay Calm</h3><p className="text-sm text-yellow-700 dark:text-yellow-400">Keep yourself and others safe first</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
          <Clock className="w-8 h-8 text-blue-500 mb-2" /><h3 className="font-semibold text-blue-800 dark:text-blue-300">Act Quickly</h3><p className="text-sm text-blue-700 dark:text-blue-400">Follow guidance until help arrives</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="emergency-situation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Describe the Emergency Situation</label>
            <textarea id="emergency-situation" value={situation} onChange={(e) => setSituation(e.target.value)} placeholder="e.g., 'Person is choking on food', 'Severe bleeding from arm cut', 'Person unconscious but breathing', 'Possible heart attack symptoms'" rows={4} className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none" disabled={isLoading} />
          </div>
          <button type="submit" disabled={!situation.trim() || isLoading} className="w-full bg-gradient-to-r from-red-500 to-orange-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2 rtl:space-x-reverse">
            {isLoading ? (<LoadingSpinner size="sm" className="text-white" />) : (<><AlertTriangle className="w-5 h-5" /><span>{t('getEmergencyGuidance')}</span></>)}
          </button>
          {user && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300">
                💾 {t('signedIn')} as <strong>{user.user_metadata?.display_name || user.email || 'Anonymous'}</strong> - 
                Your emergency guidance will be {supabaseService.isEnabled() ? 'saved to your cloud history' : 'saved locally'}
              </p>
            </div>
          )}
        </form>
      </div>

      {error && (<Alert type="error" title="Guidance Error" message={error} />)}
      {response && (<div className="animate-slide-up"><ResponseFormatter response={response} /></div>)}
    </div>
  );
};