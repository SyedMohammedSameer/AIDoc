import React from 'react';
import { CheckCircle, AlertTriangle, Info, List } from 'lucide-react';
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
      case 'warning': return 'border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-900/20';
      case 'success': return 'border-l-4 border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20';
      case 'list': return 'border-l-4 border-blue-400 bg-blue-50 dark:bg-blue-900/20';
      default: return 'border-l-4 border-gray-400 bg-gray-50 dark:bg-gray-800/20';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">{response.title}</h2>
        <p className="text-teal-100">{response.summary}</p>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {response.sections.map((section, index) => (
          <div key={index} className={`p-4 rounded-lg ${getSectionStyles(section.type)}`}>
            <div className="flex items-center gap-3 mb-3">
              {getSectionIcon(section.type)}
              <h3 className="font-semibold text-lg">{section.heading}</h3>
            </div>
            
            {section.content && (
              <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                {section.content}
              </p>
            )}
            
            {section.items && section.items.length > 0 && (
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-current rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Sources */}
      {response.sources && response.sources.length > 0 && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Sources & References
          </h4>
          <ul className="text-sm space-y-1">
            {response.sources.map((source, index) => (
              <li key={index} className="text-blue-600 dark:text-blue-400 hover:underline">
                <a href={source} target="_blank" rel="noopener noreferrer">{source}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-red-800 dark:text-red-300 mb-1">Medical Disclaimer</h4>
            <p className="text-red-700 dark:text-red-400 text-sm">{response.disclaimer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};