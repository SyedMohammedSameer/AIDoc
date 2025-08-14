import React from 'react';
import { CheckCircle, AlertTriangle, Info, List, Stethoscope, Heart, Shield } from 'lucide-react';
import type { FormattedResponse, ResponseSection } from '../types';

interface ResponseFormatterProps {
  response: FormattedResponse;
  className?: string;
}

export const ResponseFormatter: React.FC<ResponseFormatterProps> = ({ response, className = '' }) => {
  const getSectionIcon = (type: ResponseSection['type']) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'list': return <List className="w-5 h-5 text-blue-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSectionStyles = (type: ResponseSection['type']) => {
    switch (type) {
      case 'warning': 
        return 'border-l-4 border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20';
      case 'success': 
        return 'border-l-4 border-emerald-400 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20';
      case 'list': 
        return 'border-l-4 border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20';
      default: 
        return 'border-l-4 border-gray-400 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/20 dark:to-slate-800/20';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Card */}
      <div className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 text-white p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold">{response.title}</h2>
          </div>
          <p className="text-lg text-cyan-100 leading-relaxed max-w-4xl">
            {response.summary}
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-4 right-20 w-24 h-24 bg-blue-300/10 rounded-full blur-xl"></div>
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        {response.sections.map((section, index) => (
          <div key={index} className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${getSectionStyles(section.type)}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/70 dark:bg-gray-800/70 rounded-lg">
                {getSectionIcon(section.type)}
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                {section.heading}
              </h3>
            </div>
            
            {section.content && (
              <div className="mb-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                  {section.content.trim()}
                </p>
              </div>
            )}
            
            {section.items && section.items.length > 0 && (
              <div className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <div className="w-2 h-2 bg-current rounded-full mt-2 flex-shrink-0 opacity-60"></div>
                    <span className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sources Section */}
      {response.sources && response.sources.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800">
          <h4 className="font-bold text-indigo-800 dark:text-indigo-300 mb-3 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Sources & References
          </h4>
          <div className="space-y-2">
            {response.sources.map((source, index) => (
              <a 
                key={index} 
                href={source} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline decoration-2 underline-offset-2 hover:decoration-indigo-400 transition-colors"
              >
                {source}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Medical Disclaimer */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-200 dark:border-red-800 p-6 rounded-xl shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
            <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-red-800 dark:text-red-300 text-lg mb-2">
              Important Medical Disclaimer
            </h4>
            <p className="text-red-700 dark:text-red-400 leading-relaxed">
              {response.disclaimer}
            </p>
            <div className="mt-4 p-3 bg-red-100/50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                💡 <strong>Remember:</strong> Always consult with qualified healthcare professionals for medical decisions, diagnosis, and treatment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call-to-Action */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-6 rounded-xl text-center">
        <Heart className="w-8 h-8 mx-auto mb-3 text-cyan-100" />
        <p className="text-lg font-medium mb-2">
          Was this information helpful?
        </p>
        <p className="text-cyan-100 text-sm">
          VitaShifa is here to support your health journey with AI-powered guidance
        </p>
      </div>
    </div>
  );
};