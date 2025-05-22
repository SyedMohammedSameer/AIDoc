
import React, { useState, useCallback } from 'react';
import { geminiService } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { Alert } from './Alert';
import { GENERAL_DISCLAIMER, EMERGENCY_DISCLAIMER } from '../constants';
import type { GeminiResponse } from '../types';

interface EmergencyFirstAidProps {
  setIsLoading: (isLoading: boolean) => void;
}

export const EmergencyFirstAid: React.FC<EmergencyFirstAidProps> = ({ setIsLoading }) => {
  const [situation, setSituation] = useState<string>('');
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (!situation.trim()) {
      setError("Please describe the emergency situation.");
      return;
    }

    setIsLoading(true);
    setIsFetching(true);
    setError(null);
    setResponse(null);

    try {
      const result: GeminiResponse = await geminiService.getEmergencyGuidance(situation);
      if (result.text.startsWith("API Error:")) {
        setError(result.text);
        setResponse(null);
      } else {
        setResponse(result.text);
      }
    } catch (e) {
      console.error("Failed to get emergency guidance:", e);
      const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred.";
      setError(`Failed to get guidance. ${errorMessage}`);
      setResponse(null);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [situation, setIsLoading]);

  const CRITICAL_EMERGENCY_DISCLAIMER = "The information provided here is for immediate, temporary assistance ONLY until professional medical help arrives. It is NOT a substitute for professional medical evaluation or treatment. Misinformation or misapplication of first aid can be harmful.";

  return (
    <div className="p-6 bg-white rounded-xl shadow-2xl space-y-6 transform transition-all hover:scale-[1.01]">
      <h2 className="text-3xl font-bold text-red-600 mb-6 border-b-2 border-red-600 pb-3">Emergency & First Aid Guidance</h2>
      
      <Alert type="error" title="!!! URGENT: MEDICAL EMERGENCY !!!" message={<><p className="font-bold text-lg">{EMERGENCY_DISCLAIMER}</p><p className="mt-2">{CRITICAL_EMERGENCY_DISCLAIMER}</p><p className="mt-2">{GENERAL_DISCLAIMER}</p></>} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="emergencySituation" className="block text-sm font-medium text-gray-700 mb-1">
            Describe the Emergency Situation (e.g., "Choking adult", "Severe bleeding from arm", "Possible burn"):
          </label>
          <textarea
            id="emergencySituation"
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="Briefly describe the situation..."
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            disabled={isFetching}
          />
        </div>
        <button
          type="submit"
          disabled={isFetching || !situation.trim()}
          className="w-full bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isFetching ? <LoadingSpinner size="sm" color="text-white"/> : 'Get First Aid Steps'}
        </button>
      </form>

      {error && <Alert type="error" title="Error" message={error} className="mt-6" />}
      
      {response && (
        <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-lg shadow space-y-3">
          <h3 className="text-xl font-semibold text-red-700">AI First Aid Guidance:</h3>
          <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
            {response}
          </div>
        </div>
      )}
    </div>
  );
};
    