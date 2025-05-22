
import React, { useState, useCallback } from 'react';
import { geminiService } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { Alert } from './Alert';
import { GENERAL_DISCLAIMER, CHRONIC_CONDITIONS_OPTIONS } from '../constants';
import type { HealthManagementInput, GeminiResponse } from '../types';

interface HealthManagementProps {
  setIsLoading: (isLoading: boolean) => void;
}

export const HealthManagement: React.FC<HealthManagementProps> = ({ setIsLoading }) => {
  const [healthInput, setHealthInput] = useState<HealthManagementInput>({
    chronicConditions: [],
    currentSymptoms: '',
    lifestyleFactors: '',
    healthGoals: '',
  });
  const [otherCondition, setOtherCondition] = useState<string>('');
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setHealthInput(prev => ({ ...prev, [name]: value }));
  }, []);
  
  const handleConditionChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    setHealthInput(prev => {
      let updatedConditions = [...prev.chronicConditions];
      if (checked) {
        if (!updatedConditions.includes(value)) {
          updatedConditions.push(value);
        }
      } else {
        updatedConditions = updatedConditions.filter(condition => condition !== value);
      }
      return { ...prev, chronicConditions: updatedConditions };
    });
  }, []);


  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setIsFetching(true);
    setError(null);
    setResponse(null);

    let finalConditions = [...healthInput.chronicConditions];
    if (otherCondition.trim() && healthInput.chronicConditions.includes("Other (please specify)")) {
        // Replace "Other (please specify)" with the actual other condition if provided
        finalConditions = finalConditions.filter(c => c !== "Other (please specify)");
        finalConditions.push(otherCondition.trim());
    }
    
    const payload: HealthManagementInput = { ...healthInput, chronicConditions: finalConditions };

    try {
      const result: GeminiResponse = await geminiService.getHealthManagementAdvice(payload);
      if (result.text.startsWith("API Error:")) {
        setError(result.text);
        setResponse(null);
      } else {
        setResponse(result.text);
      }
    } catch (e) {
      console.error("Failed to get health advice:", e);
      const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred.";
      setError(`Failed to get health advice. ${errorMessage}`);
      setResponse(null);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [healthInput, otherCondition, setIsLoading]);
  
  const SPECIFIC_DISCLAIMER = "AI-generated health plans are for informational purposes and general guidance. They are not a substitute for personalized medical advice from a healthcare professional. Discuss any health plan or lifestyle changes with your doctor.";

  return (
    <div className="p-6 bg-white rounded-xl shadow-2xl space-y-6 transform transition-all hover:scale-[1.01]">
      <h2 className="text-3xl font-bold text-primary mb-6 border-b-2 border-primary pb-3">Health Management & Wellness</h2>
      
      <Alert type="info" title="Important Considerations" message={<><p>{SPECIFIC_DISCLAIMER}</p><p className="mt-2">{GENERAL_DISCLAIMER}</p></>} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Chronic Conditions (select all that apply):</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CHRONIC_CONDITIONS_OPTIONS.map(condition => (
              <label key={condition} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-md hover:bg-lightbg cursor-pointer">
                <input
                  type="checkbox"
                  name="chronicConditions"
                  value={condition}
                  checked={healthInput.chronicConditions.includes(condition)}
                  onChange={handleConditionChange}
                  className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary"
                  disabled={isFetching}
                />
                <span className="text-sm text-gray-700">{condition}</span>
              </label>
            ))}
          </div>
          {healthInput.chronicConditions.includes("Other (please specify)") && (
            <input
                type="text"
                placeholder="Specify other condition"
                value={otherCondition}
                onChange={(e) => setOtherCondition(e.target.value)}
                className="mt-2 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary"
                disabled={isFetching}
            />
          )}
        </div>

        <div>
          <label htmlFor="currentSymptoms" className="block text-sm font-medium text-gray-700 mb-1">Current Symptoms:</label>
          <textarea
            id="currentSymptoms"
            name="currentSymptoms"
            value={healthInput.currentSymptoms}
            onChange={handleInputChange}
            placeholder="Describe any current symptoms you are experiencing."
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary"
            disabled={isFetching}
          />
        </div>

        <div>
          <label htmlFor="lifestyleFactors" className="block text-sm font-medium text-gray-700 mb-1">Lifestyle Factors:</label>
          <textarea
            id="lifestyleFactors"
            name="lifestyleFactors"
            value={healthInput.lifestyleFactors}
            onChange={handleInputChange}
            placeholder="Briefly describe your diet, exercise habits, stress levels, sleep patterns, etc."
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary"
            disabled={isFetching}
          />
        </div>
        
        <div>
          <label htmlFor="healthGoals" className="block text-sm font-medium text-gray-700 mb-1">Health Goals:</label>
          <textarea
            id="healthGoals"
            name="healthGoals"
            value={healthInput.healthGoals}
            onChange={handleInputChange}
            placeholder="e.g., Lower blood sugar, manage stress, improve sleep, lose weight."
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary"
            disabled={isFetching}
          />
        </div>

        <button
          type="submit"
          disabled={isFetching}
          className="w-full bg-primary text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isFetching ? <LoadingSpinner size="sm" color="text-white"/> : 'Get Personalized Advice'}
        </button>
      </form>

      {error && <Alert type="error" title="Error" message={error} className="mt-6" />}
      
      {response && (
        <div className="mt-8 p-6 bg-lightbg rounded-lg shadow space-y-3">
          <h3 className="text-xl font-semibold text-secondary">AI Health Plan:</h3>
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
            {response}
          </div>
        </div>
      )}
    </div>
  );
};
    