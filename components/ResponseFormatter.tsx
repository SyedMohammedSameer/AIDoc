import React from 'react';
import { CheckCircle, AlertTriangle, Info, List, Stethoscope, Heart, Shield, Star, Clock, User } from 'lucide-react';
import type { FormattedResponse, ResponseSection } from '../types';

interface ResponseFormatterProps {
  response: FormattedResponse;
  className?: string;
}

export const ResponseFormatter: React.FC<ResponseFormatterProps> = ({ response, className = '' }) => {
  
  // Clean up text by removing any residual markdown formatting
  const cleanText = (text: string): string => {
    return text
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove **bold**
      .replace(/\*([^*]+)\*/g, '$1')     // Remove *italic*
      .replace(/#{1,6}\s*/g, '')        // Remove headers
      .trim();
  };

  const getSectionIcon = (type: ResponseSection['type'], heading: string) => {
    const lowerHeading = heading.toLowerCase();
    
    if (lowerHeading.includes('warning') || lowerHeading.includes('caution') || type === 'warning') {
      return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    }
    if (lowerHeading.includes('symptom') || lowerHeading.includes('sign')) {
      return <Stethoscope className="w-5 h-5 text-blue-500" />;
    }
    if (lowerHeading.includes('treatment') || lowerHeading.includes('medication')) {
      return <Heart className="w-5 h-5 text-emerald-500" />;
    }
    if (lowerHeading.includes('when') || lowerHeading.includes('urgent')) {
      return <Clock className="w-5 h-5 text-red-500" />;
    }
    if (type === 'list') {
      return <List className="w-5 h-5 text-indigo-500" />;
    }
    
    return <Info className="w-5 h-5 text-blue-500" />;
  };

  const getSectionStyles = (type: ResponseSection['type'], heading: string) => {
    const lowerHeading = heading.toLowerCase();
    
    if (lowerHeading.includes('warning') || lowerHeading.includes('caution') || type === 'warning') {
      return 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-l-4 border-amber-400';
    }
    if (lowerHeading.includes('urgent') || lowerHeading.includes('emergency')) {
      return 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10 border-l-4 border-red-400';
    }
    if (lowerHeading.includes('treatment') || lowerHeading.includes('medication')) {
      return 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 border-l-4 border-emerald-400';
    }
    
    return 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-l-4 border-blue-400';
  };

  // Use the structured sections directly from the response
  const displaySections = response.sections || [];

  return (
    <div className={`space-y-6 min-h-screen ${className}`}>
      {/* Clean Header */}
      <div className="bg-gradient-to-br from-teal-500 via-blue-500 to-indigo-600 text-white rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm flex-shrink-0">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3 leading-tight">
                {cleanText(response.title || 'Medical Information')}
              </h2>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-6 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Personalized Response</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>AI-Powered Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Medically Reviewed Format</span>
            </div>
          </div>
        </div>
        
        {/* Subtle decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-blue-300/10 rounded-full blur-2xl"></div>
      </div>

      {/* Clean Content Sections */}
      <div className="space-y-4">
        {displaySections.map((section, index) => (
          <div 
            key={index} 
            className={`rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${getSectionStyles(section.type, section.heading)}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-sm">
                {getSectionIcon(section.type, section.heading)}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {cleanText(section.heading)}
              </h3>
            </div>
            
            {section.content && (
              <div className="mb-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                  {cleanText(section.content)}
                </p>
              </div>
            )}
            
            {section.items && section.items.length > 0 && (
              <div className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <div 
                    key={itemIndex} 
                    className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-current rounded-full mt-2 flex-shrink-0 opacity-60"></div>
                    <span className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                      {cleanText(item)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Medical Disclaimer - Clean and Professional */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex-shrink-0">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-lg mb-3">
              Medical Disclaimer
            </h4>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              This AI-generated information is for educational purposes only and should not replace professional medical advice, diagnosis, or treatment.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <strong>Always consult with qualified healthcare professionals for medical decisions.</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Call-to-Action */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl p-6 text-center shadow-lg">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Heart className="w-6 h-6 text-cyan-100" />
          <span className="text-lg font-semibold">VitaShifa AI Health Assistant</span>
        </div>
        <p className="text-cyan-100">
          Supporting your health journey with AI-powered guidance and information
        </p>
      </div>
    </div>
  );
};