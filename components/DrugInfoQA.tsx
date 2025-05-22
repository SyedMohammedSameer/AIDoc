
import React, { useState, useCallback } from 'react';
import { geminiService } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { Alert } from './Alert';
import { GENERAL_DISCLAIMER } from '../constants';
import type { GroundingChunk, GeminiResponse } from '../types';

interface DrugInfoQAProps {
  setIsLoading: (isLoading: boolean) => void;
}

export const DrugInfoQA: React.FC<DrugInfoQAProps> = ({ setIsLoading }) => {
  const [query, setQuery] = useState<string>('');
  const [response, setResponse] = useState<string | null>(null);
  const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) {
      setError("Please enter a drug name or medical question.");
      return;
    }

    setIsLoading(true);
    setIsFetching(true);
    setError(null);
    setResponse(null);
    setGroundingChunks([]);

    try {
      // Using getMedicalAnswer as a general Q&A endpoint for now. 
      // Could be split if prompts need to be very different.
      const result: GeminiResponse = await geminiService.getMedicalAnswer(query);
      if (result.text.startsWith("API Error:")) {
        setError(result.text);
        setResponse(null);
      } else {
        setResponse(result.text);
        if (result.candidates && result.candidates[0]?.groundingMetadata?.groundingChunks) {
          setGroundingChunks(result.candidates[0].groundingMetadata.groundingChunks);
        }
      }
    } catch (e) {
      console.error("Failed to get answer:", e);
      const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred.";
      setError(`Failed to get answer. ${errorMessage}`);
      setResponse(null);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [query, setIsLoading]);

  return (
    <div className="p-6 bg-white rounded-xl shadow-2xl space-y-6 transform transition-all hover:scale-[1.01]">
      <h2 className="text-3xl font-bold text-primary mb-6 border-b-2 border-primary pb-3">Drug Information & Medical Q/A</h2>
      
      <Alert type="info" title="Important Note" message={GENERAL_DISCLAIMER} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="drugQuery" className="block text-sm font-medium text-gray-700 mb-1">
            Ask about medications, symptoms, or health conditions:
          </label>
          <textarea
            id="drugQuery"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., 'What are the side effects of metformin?', 'Tell me about asthma treatment options'"
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            disabled={isFetching}
          />
        </div>
        <button
          type="submit"
          disabled={isFetching || !query.trim()}
          className="w-full bg-primary text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isFetching ? <LoadingSpinner size="sm" color="text-white"/> : 'Get Information'}
        </button>
      </form>

      {error && <Alert type="error" title="Error" message={error} className="mt-6" />}
      
      {response && (
        <div className="mt-8 p-6 bg-lightbg rounded-lg shadow space-y-3">
          <h3 className="text-xl font-semibold text-secondary">AI Response:</h3>
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
            {response}
          </div>
           {groundingChunks.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-300">
              <h4 className="text-md font-semibold text-secondary mb-2">Sources:</h4>
              <ul className="list-disc list-inside space-y-1 text-xs">
                {groundingChunks.map((chunk, index) => (
                  chunk.web && chunk.web.uri && (
                    <li key={index}>
                      <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {chunk.web.title || chunk.web.uri}
                      </a>
                    </li>
                  )
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
    