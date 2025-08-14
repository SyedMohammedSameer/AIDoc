import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle, XCircle, Copy } from 'lucide-react';

interface EnvDebugProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EnvDebug: React.FC<EnvDebugProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const envVars = {
    VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
    VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
    VITE_GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
  };

  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN', 
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  const missingVars = requiredVars.filter(key => !envVars[key as keyof typeof envVars]);
  const hasAllRequired = missingVars.length === 0;

  const copyEnvTemplate = () => {
    const template = `# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key_here`;

    navigator.clipboard.writeText(template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusIcon = (value: string | undefined) => {
    return value ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />;
  };

  const formatValue = (key: string, value: string | undefined) => {
    if (!value) return 'MISSING';
    if (key.includes('API_KEY') && value.length > 20) {
      return `${value.substring(0, 15)}...`;
    }
    return value;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Environment Variables Debug</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Overall Status */}
          <div className={`p-4 rounded-lg border-2 ${
            hasAllRequired 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              {hasAllRequired ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
              <h3 className="text-lg font-semibold">
                {hasAllRequired ? 'Environment Variables Loaded ✅' : 'Missing Environment Variables ❌'}
              </h3>
            </div>
            {!hasAllRequired && (
              <p className="text-sm text-red-700 dark:text-red-300">
                Missing: {missingVars.join(', ')}
              </p>
            )}
          </div>

          {/* Environment Variables List */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">Environment Variables Status:</h4>
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(value)}
                  <span className="font-mono text-sm">{key}</span>
                </div>
                <span className={`font-mono text-sm ${
                  value ? 'text-green-600 dark:text-green-400' : 'text-red-500'
                }`}>
                  {formatValue(key, value)}
                </span>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Setup Instructions:</h4>
            <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-2 list-decimal list-inside">
              <li>Create a <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">.env</code> file in your project root directory</li>
              <li>Copy the template below and add your Firebase values</li>
              <li>Restart your development server completely (Ctrl+C then npm run dev)</li>
              <li>Refresh this page to check if variables are loaded</li>
            </ol>
          </div>

          {/* Template */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">.env File Template:</h4>
              <button
                onClick={copyEnvTemplate}
                className="flex items-center gap-2 px-3 py-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg text-sm transition-colors"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto">
{`# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key_here`}
            </pre>
          </div>

          {/* Expected File Structure for Your Project */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Expected File Structure (Your Project):</h4>
            <pre className="text-xs text-gray-700 dark:text-gray-300">
{`vitashifa/
├── .env                 ← Environment variables file (CREATE THIS)
├── package.json
├── vite.config.ts
├── components/
├── services/
├── App.tsx
└── ...`}
            </pre>
          </div>

          {/* Common Issues */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">Common Issues:</h4>
            <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1 list-disc list-inside">
              <li>Make sure the <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">.env</code> file is in the project root (same level as package.json)</li>
              <li>Variable names must start with <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">VITE_</code></li>
              <li>No quotes around values in the .env file</li>
              <li>Restart your dev server completely after creating/editing .env</li>
              <li>Check for typos in variable names</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};