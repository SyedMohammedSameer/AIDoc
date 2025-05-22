
import React, { useState, useCallback } from 'react';
import { geminiService } from '../services/geminiService';
import { ImageUpload } from './ImageUpload';
import { LoadingSpinner } from './LoadingSpinner';
import { Alert } from './Alert';
import { GENERAL_DISCLAIMER } from '../constants';
import type { GeminiResponse } from '../types';

interface MedicalImageAnalysisProps {
  setIsLoading: (isLoading: boolean) => void;
}

export const MedicalImageAnalysis: React.FC<MedicalImageAnalysisProps> = ({ setIsLoading }) => {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>('Analyze this medical image and provide detailed observations. What are potential areas of concern?');
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const handleImageUpload = useCallback((base64: string, file: File) => {
    setImageBase64(base64);
    setImageFile(file);
    setResponse(null); // Clear previous response
    setError(null); // Clear previous error
  }, []);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (!imageBase64 || !imageFile) {
      setError("Please upload a medical image.");
      return;
    }
    if (!prompt.trim()) {
      setError("Please provide a prompt or question about the image.");
      return;
    }

    setIsLoading(true);
    setIsFetching(true);
    setError(null);
    setResponse(null);

    try {
      const result: GeminiResponse = await geminiService.analyzeMedicalImage(imageBase64, imageFile.type, prompt);
      if (result.text.startsWith("API Error:")) {
        setError(result.text);
        setResponse(null);
      } else {
        setResponse(result.text);
      }
    } catch (e) {
      console.error("Failed to analyze image:", e);
      const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred.";
      setError(`Failed to analyze image. ${errorMessage}`);
      setResponse(null);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [imageBase64, imageFile, prompt, setIsLoading]);

  const SPECIFIC_DISCLAIMER = "AI image analysis is experimental and not a diagnostic tool. Observations provided are for informational purposes only and may not be accurate or complete. Always consult a qualified radiologist or medical specialist for diagnosis and interpretation of medical images.";

  return (
    <div className="p-6 bg-white rounded-xl shadow-2xl space-y-6 transform transition-all hover:scale-[1.01]">
      <h2 className="text-3xl font-bold text-primary mb-6 border-b-2 border-primary pb-3">Medical Image Analysis</h2>
      
      <Alert type="warning" title="Critical Disclaimer" message={<><p>{SPECIFIC_DISCLAIMER}</p><p className="mt-2">{GENERAL_DISCLAIMER}</p></>} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Medical Image (X-ray, CT, MRI, Skin, ECG, Lab Report Image):
          </label>
          <ImageUpload onImageUpload={handleImageUpload} acceptedFileTypes={['image/jpeg', 'image/png', 'image/webp', 'image/gif']} />
        </div>

        <div>
          <label htmlFor="imagePrompt" className="block text-sm font-medium text-gray-700 mb-1">
            Analysis Prompt (optional - describe what to look for):
          </label>
          <textarea
            id="imagePrompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Check for abnormalities in this chest X-ray.', 'Describe findings in this skin lesion image.'"
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            disabled={isFetching}
          />
        </div>

        <button
          type="submit"
          disabled={isFetching || !imageBase64}
          className="w-full bg-primary text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isFetching ? <LoadingSpinner size="sm" color="text-white"/> : 'Analyze Image'}
        </button>
      </form>

      {error && <Alert type="error" title="Analysis Error" message={error} className="mt-6" />}
      
      {response && (
        <div className="mt-8 p-6 bg-lightbg rounded-lg shadow space-y-3">
          <h3 className="text-xl font-semibold text-secondary">AI Analysis:</h3>
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
            {response}
          </div>
        </div>
      )}
    </div>
  );
};
    