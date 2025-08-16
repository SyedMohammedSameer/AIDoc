// components/EnhancedEmailInput.tsx
import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertTriangle, X, Lightbulb } from 'lucide-react';
import { EmailValidator, type EmailValidationResult } from '../utils/emailValidation';

interface EnhancedEmailInputProps {
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  onValidationChange?: (validation: EmailValidationResult | null) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  autoComplete?: string;
  label?: string;
  showSuggestions?: boolean;
}

export const EnhancedEmailInput: React.FC<EnhancedEmailInputProps> = ({
  value,
  onChange,
  onValidationChange,
  placeholder = "Enter your email address",
  required = false,
  disabled = false,
  className = "",
  autoComplete = "email",
  label = "Email Address",
  showSuggestions = true
}) => {
  const [validation, setValidation] = useState<EmailValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [acceptedSuggestion, setAcceptedSuggestion] = useState(false);

  // Debounced validation
  useEffect(() => {
    if (!value.trim()) {
      setValidation(null);
      setIsValidating(false);
      onValidationChange?.(null);
      return;
    }

    setIsValidating(true);
    
    const timer = setTimeout(() => {
      const result = EmailValidator.validateEmail(value);
      setValidation(result);
      setIsValidating(false);
      onValidationChange?.(result);
      onChange(value, result.isValid);
    }, 300);

    return () => clearTimeout(timer);
  }, [value, onChange, onValidationChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue, validation?.isValid || false);
    setAcceptedSuggestion(false);
  };

  const applySuggestion = (suggestion: string) => {
    // Extract suggested email from suggestion text
    const emailMatch = suggestion.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      const suggestedEmail = emailMatch[1];
      onChange(suggestedEmail, true);
      setAcceptedSuggestion(true);
      setShowDetails(false);
    }
  };

  const getValidationColor = () => {
    if (!validation) return 'border-gray-300 dark:border-gray-600';
    
    switch (validation.level) {
      case 'valid':
        return 'border-green-500 dark:border-green-400';
      case 'warning':
        return 'border-yellow-500 dark:border-yellow-400';
      case 'error':
        return 'border-red-500 dark:border-red-400';
      default:
        return 'border-gray-300 dark:border-gray-600';
    }
  };

  const getValidationIcon = () => {
    if (isValidating) {
      return <div className="animate-spin w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full" />;
    }
    
    if (!validation) return <Mail className="w-5 h-5 text-gray-400" />;
    
    switch (validation.level) {
      case 'valid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <X className="w-5 h-5 text-red-500" />;
      default:
        return <Mail className="w-5 h-5 text-gray-400" />;
    }
  };

  const getValidationMessage = () => {
    if (!validation) return null;
    return EmailValidator.getValidationMessage(validation);
  };

  const hasIssues = validation && (validation.issues.length > 0 || validation.suggestions.length > 0);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label htmlFor="email-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Container */}
      <div className="relative">
        <div className={`relative flex items-center transition-all duration-200 ${getValidationColor()}`}>
          {/* Icon */}
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            {getValidationIcon()}
          </div>

          {/* Input */}
          <input
            id="email-input"
            type="email"
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            autoComplete={autoComplete}
            className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
              transition-all duration-200 ${getValidationColor()}`}
          />

          {/* Details Toggle */}
          {hasIssues && showSuggestions && (
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
            >
              <Lightbulb className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Validation Message */}
        {validation && (
          <div className={`text-sm mt-1 flex items-center space-x-1 ${
            validation.level === 'valid' ? 'text-green-600 dark:text-green-400' :
            validation.level === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
            'text-red-600 dark:text-red-400'
          }`}>
            <span>{getValidationMessage()}</span>
            {validation.isValid && (
              <div className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                Score: {validation.score}/100
              </div>
            )}
          </div>
        )}

        {/* Detailed Feedback */}
        {showDetails && validation && hasIssues && (
          <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
            {/* Issues */}
            {validation.issues.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">Issues Found:</h4>
                <ul className="space-y-1">
                  {validation.issues.map((issue, index) => (
                    <li key={index} className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-2">
                      <X className="w-3 h-3 flex-shrink-0" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {validation.suggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2">Suggestions:</h4>
                <ul className="space-y-2">
                  {validation.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-yellow-600 dark:text-yellow-400">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Lightbulb className="w-3 h-3 flex-shrink-0" />
                          <span>{suggestion}</span>
                        </div>
                        {suggestion.includes('@') && (
                          <button
                            type="button"
                            onClick={() => applySuggestion(suggestion)}
                            className="ml-2 px-2 py-1 text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 
                              hover:bg-teal-200 dark:hover:bg-teal-900/50 rounded transition-colors"
                          >
                            Apply
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Email Quality Score */}
            {validation.score > 0 && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Email Quality Score:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          validation.score >= 80 ? 'bg-green-500' :
                          validation.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${validation.score}%` }}
                      />
                    </div>
                    <span className={`font-medium ${
                      validation.score >= 80 ? 'text-green-600 dark:text-green-400' :
                      validation.score >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {validation.score}/100
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Higher scores indicate better deliverability and lower bounce rates
                </p>
              </div>
            )}
          </div>
        )}

        {/* Success message for accepted suggestions */}
        {acceptedSuggestion && (
          <div className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center space-x-1">
            <CheckCircle className="w-4 h-4" />
            <span>Great! Email updated with suggestion.</span>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        We validate emails to ensure reliable delivery and prevent bounce backs.
      </div>
    </div>
  );
};