import React, { useState } from 'react';
import { Heart, Target } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { firebaseService } from '../services/firebase';
import { LoadingSpinner } from './LoadingSpinner';
import { ResponseFormatter } from './ResponseFormatter';
import { Alert } from './Alert';
import { CHRONIC_CONDITIONS_OPTIONS } from '../constants';
import { NavigationTab } from '../types';
import type { HealthManagementInput, FormattedResponse } from '../types';

interface WellnessPlanningProps {
  user?: any;
  onChatSaved?: () => void;
}

export const WellnessPlanning: React.FC<WellnessPlanningProps> = ({ user, onChatSaved }) => {
  const [formData, setFormData] = useState<HealthManagementInput>({
    chronicConditions: [],
    currentSymptoms: '',
    lifestyleFactors: '',
    healthGoals: '',
  });
  const [otherCondition, setOtherCondition] = useState('');
  const [response, setResponse] = useState<FormattedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleConditionToggle = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      chronicConditions: prev.chronicConditions.includes(condition)
        ? prev.chronicConditions.filter(c => c !== condition)
        : [...prev.chronicConditions, condition]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResponse(null);
    setSaveStatus('idle');

    // Include other condition if specified
    let finalConditions = [...formData.chronicConditions];
    if (otherCondition.trim() && formData.chronicConditions.includes("Other (please specify)")) {
      finalConditions = finalConditions.filter(c => c !== "Other (please specify)");
      finalConditions.push(otherCondition.trim());
    }

    const payload = { ...formData, chronicConditions: finalConditions };

    try {
      const result = await geminiService.getWellnessPlan(payload);
      if (result.response.text.startsWith('API Error:')) {
        setError(result.response.text);
      } else {
        setResponse(result.formatted);
        
        // Save to Firebase/localStorage
        setSaveStatus('saving');
        try {
          const queryText = `Wellness Plan Request:
Conditions: ${finalConditions.join(', ') || 'None'}
Symptoms: ${payload.currentSymptoms || 'None'}
Lifestyle: ${payload.lifestyleFactors || 'Not specified'}
Goals: ${payload.healthGoals || 'General wellness'}`;

          await firebaseService.saveChat(
            NavigationTab.HEALTH_MANAGEMENT,
            queryText,
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
      setError('Failed to generate wellness plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSaveStatusMessage = () => {
    switch (saveStatus) {
      case 'saving':
        return { type: 'info' as const, message: 'Saving wellness plan...' };
      case 'saved':
        return { 
          type: 'success' as const, 
          message: firebaseService.isEnabled() ? 'Wellness plan saved to your history' : 'Wellness plan saved locally'
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
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white px-4 py-2 rounded-full">
          <Heart className="w-5 h-5" />
          <span className="font-medium">Personalized Wellness Planning</span>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Create a tailored health and wellness plan based on your needs</p>
      </div>

      {/* Disclaimer */}
      <Alert 
        type="info" 
        title="Wellness Guidance"
        message="AI-generated wellness plans are for informational purposes. Always discuss health plans with your healthcare provider before implementation."
      />

      {/* Save Status */}
      {getSaveStatusMessage() && (
        <Alert 
          type={getSaveStatusMessage()!.type}
          message={getSaveStatusMessage()!.message}
        />
      )}

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Chronic Conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Do you have any chronic conditions? (Select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CHRONIC_CONDITIONS_OPTIONS.map(condition => (
                <label key={condition} className="flex items-center space-x-2 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.chronicConditions.includes(condition)}
                    onChange={() => handleConditionToggle(condition)}
                    className="rounded text-teal-500 focus:ring-teal-500"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{condition}</span>
                </label>
              ))}
            </div>
            {formData.chronicConditions.includes("Other (please specify)") && (
              <input
                type="text"
                placeholder="Specify other condition"
                value={otherCondition}
                onChange={(e) => setOtherCondition(e.target.value)}
                className="mt-3 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                disabled={isLoading}
              />
            )}
          </div>

          {/* Current Symptoms */}
          <div>
            <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Symptoms or Concerns
            </label>
            <textarea
              id="symptoms"
              value={formData.currentSymptoms}
              onChange={(e) => setFormData(prev => ({ ...prev, currentSymptoms: e.target.value }))}
              placeholder="Describe any current symptoms, pain, or health concerns you're experiencing..."
              rows={3}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
              disabled={isLoading}
            />
          </div>

          {/* Lifestyle Factors */}
          <div>
            <label htmlFor="lifestyle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Lifestyle & Habits
            </label>
            <textarea
              id="lifestyle"
              value={formData.lifestyleFactors}
              onChange={(e) => setFormData(prev => ({ ...prev, lifestyleFactors: e.target.value }))}
              placeholder="Describe your diet, exercise routine, sleep patterns, stress levels, work environment, etc..."
              rows={3}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
              disabled={isLoading}
            />
          </div>

          {/* Health Goals */}
          <div>
            <label htmlFor="goals" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Health & Wellness Goals
            </label>
            <textarea
              id="goals"
              value={formData.healthGoals}
              onChange={(e) => setFormData(prev => ({ ...prev, healthGoals: e.target.value }))}
              placeholder="What do you want to achieve? e.g., lose weight, improve energy, manage stress, better sleep, increase fitness..."
              rows={3}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" className="text-white" />
            ) : (
              <>
                <Target className="w-5 h-5" />
                <span>Create My Wellness Plan</span>
              </>
            )}
          </button>

          {/* User Context Info */}
          {user && (
            <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
              <p className="text-sm text-pink-700 dark:text-pink-300">
                💾 Signed in as <strong>{user.displayName || user.email || 'Anonymous'}</strong> - 
                Your wellness plan will be {firebaseService.isEnabled() ? 'saved to your cloud history' : 'saved locally'}
              </p>
            </div>
          )}
        </form>
      </div>

      {/* Error */}
      {error && (
        <Alert type="error" title="Planning Error" message={error} />
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