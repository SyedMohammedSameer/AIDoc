import React, { useState, useRef } from 'react';
import { Upload, Camera, Scan, X } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { supabaseService } from '../services/supabase';
import { LoadingSpinner } from './LoadingSpinner';
import { ResponseFormatter } from './ResponseFormatter';
import { Alert } from './Alert';
import { useLanguage } from '../contexts/LanguageContext';
import { NavigationTab } from '../types';
import type { FormattedResponse } from '../types';

interface ImageAnalysisProps {
  user?: any;
  onChatSaved?: () => void;
}

export const ImageAnalysis: React.FC<ImageAnalysisProps> = ({ user, onChatSaved }) => {
  const [image, setImage] = useState<{ file: File; preview: string } | null>(null);
  const [prompt, setPrompt] = useState('Analyze this medical image and provide detailed observations about any visible abnormalities or findings.');
  const [response, setResponse] = useState<FormattedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, currentLanguage } = useLanguage();

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('Image size must be less than 10MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage({ file, preview: e.target?.result as string });
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || isLoading) return;
    setIsLoading(true);
    setError(null);
    setResponse(null);
    setSaveStatus('idle');
    try {
      const result = await geminiService.analyzeImage(image.preview, image.file.type, prompt, currentLanguage.name);
      if (result.response.text.startsWith('API Error:')) {
        setError(result.response.text);
      } else {
        setResponse(result.formatted);
        setSaveStatus('saving');
        try {
          const queryText = `Image Analysis: ${prompt} [Image: ${image.file.name}]`;
          await supabaseService.saveChat(NavigationTab.IMAGE_ANALYSIS, queryText, result.formatted);
          setSaveStatus('saved');
          onChatSaved?.();
          setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (saveError) {
          console.error('Failed to save chat:', saveError);
          setSaveStatus('error');
        }
      }
    } catch (err) {
      setError('Failed to analyze image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSaveStatusMessage = () => {
    switch (saveStatus) {
      case 'saving': return { type: 'info' as const, message: 'Saving image analysis...' };
      case 'saved': return { type: 'success' as const, message: supabaseService.isEnabled() ? 'Analysis saved to your history' : 'Analysis saved locally' };
      case 'error': return { type: 'warning' as const, message: 'Saved locally only - cloud sync failed' };
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full">
          <Scan className="w-5 h-5" />
          <span className="font-medium">{t('imageAnalysisTitle')}</span>
        </div>
        <p className="text-gray-600 dark:text-gray-400">{t('imageAnalysisDesc')}</p>
      </div>

      <Alert type="warning" title={t('importantDisclaimer')} message={t('disclaimerMessage')} />
      {getSaveStatusMessage() && (<Alert type={getSaveStatusMessage()!.type} message={getSaveStatusMessage()!.message} />)}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        {!image ? (
          <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-teal-500 transition-colors cursor-pointer">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">{t('uploadImage')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('imageSupport')}</p>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} className="hidden" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img src={image.preview} alt="Medical image for analysis" className="w-full max-h-96 object-contain rounded-lg border border-gray-200 dark:border-gray-700" />
              <button onClick={() => setImage(null)} className="absolute top-2 end-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label htmlFor="analysis-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('analysisInstructions')}</label>
              <textarea id="analysis-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white" disabled={isLoading} />
            </div>
            <button onClick={handleSubmit} disabled={isLoading} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2 rtl:space-x-reverse">
              {isLoading ? (<LoadingSpinner size="sm" className="text-white" />) : (<><Camera className="w-5 h-5" /><span>{t('analyzeImage')}</span></>)}
            </button>
            {user && (
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  💾 {t('signedIn')} as <strong>{user.user_metadata?.display_name || user.email || 'Anonymous'}</strong> - 
                  Your image analysis will be {supabaseService.isEnabled() ? 'saved to your cloud history' : 'saved locally'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (<Alert type="error" title="Analysis Error" message={error} />)}
      {response && (<div className="animate-slide-up"><ResponseFormatter response={response} /></div>)}
    </div>
  );
};