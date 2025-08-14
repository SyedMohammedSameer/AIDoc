// components/FirebaseDebug.tsx
import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { firebaseService } from '../services/firebase';

interface FirebaseDebugProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseDebug: React.FC<FirebaseDebugProps> = ({ isOpen, onClose }) => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }
  }, [isOpen]);

  const runDiagnostics = async () => {
    setIsLoading(true);
    
    const info: any = {
      timestamp: new Date().toISOString(),
      environment: {},
      firebase: {},
      connectivity: {},
      errors: []
    };

    try {
      // Check environment variables
      info.environment = {
        NODE_ENV: import.meta.env.NODE_ENV,
        VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ? 
          `${import.meta.env.VITE_FIREBASE_API_KEY.substring(0, 10)}...` : 'MISSING',
        VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'MISSING',
        VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'MISSING',
        VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID ? 
          `${import.meta.env.VITE_FIREBASE_APP_ID.substring(0, 10)}...` : 'MISSING',
        hasAllRequired: !!(
          import.meta.env.VITE_FIREBASE_API_KEY &&
          import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
          import.meta.env.VITE_FIREBASE_PROJECT_ID &&
          import.meta.env.VITE_FIREBASE_APP_ID
        )
      };

      // Check Firebase service status
      info.firebase = {
        isEnabled: firebaseService.isEnabled(),
        currentUser: firebaseService.getCurrentUser() ? 'Present' : 'None',
        userEmail: firebaseService.getCurrentUser()?.email || 'N/A'
      };

      // Test Firebase initialization manually
      try {
        await firebaseService.initialize();
        info.firebase.initializationResult = 'Success';
      } catch (initError: any) {
        info.firebase.initializationResult = 'Failed';
        info.firebase.initializationError = initError.message;
        info.errors.push(`Initialization: ${initError.message}`);
      }

      // Test connectivity to Firebase
      try {
        const response = await fetch('https://firebase.googleapis.com/', { method: 'HEAD' });
        info.connectivity.firebaseReachable = response.ok;
      } catch (connectError: any) {
        info.connectivity.firebaseReachable = false;
        info.errors.push(`Connectivity: ${connectError.message}`);
      }

      // Test actual Firebase import
      try {
        const { initializeApp } = await import('firebase/app');
        info.firebase.firebaseImportWorking = true;
      } catch (importError: any) {
        info.firebase.firebaseImportWorking = false;
        info.errors.push(`Firebase Import: ${importError.message}`);
      }

      // Test configuration object creation
      try {
        const config = {
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId: import.meta.env.VITE_FIREBASE_APP_ID
        };

        const missingFields = Object.entries(config)
          .filter(([key, value]) => !value)
          .map(([key]) => key);

        info.firebase.configValid = missingFields.length === 0;
        info.firebase.missingFields = missingFields;

        if (missingFields.length > 0) {
          info.errors.push(`Missing config fields: ${missingFields.join(', ')}`);
        }
      } catch (configError: any) {
        info.errors.push(`Config Error: ${configError.message}`);
      }

    } catch (error: any) {
      info.errors.push(`General Error: ${error.message}`);
    }

    setDebugInfo(info);
    setIsLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
  };

  const getStatusIcon = (status: boolean | string) => {
    if (typeof status === 'boolean') {
      return status ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />;
    }
    return <AlertCircle className="w-4 h-4 text-yellow-500" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Firebase Debug Console</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Running diagnostics...</p>
            </div>
          ) : (
            <>
              {/* Environment Variables */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  {getStatusIcon(debugInfo.environment?.hasAllRequired)}
                  Environment Variables
                </h3>
                <div className="space-y-2 text-sm font-mono">
                  {Object.entries(debugInfo.environment || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                      <span className={value === 'MISSING' ? 'text-red-500' : 'text-green-600 dark:text-green-400'}>
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Firebase Status */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  {getStatusIcon(debugInfo.firebase?.isEnabled)}
                  Firebase Service
                </h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(debugInfo.firebase || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                      <span className="font-mono">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connectivity */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  {getStatusIcon(debugInfo.connectivity?.firebaseReachable)}
                  Connectivity
                </h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(debugInfo.connectivity || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                      <span className="font-mono">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Errors */}
              {debugInfo.errors?.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-red-700 dark:text-red-400">
                    <XCircle className="w-5 h-5" />
                    Errors Found
                  </h3>
                  <div className="space-y-2">
                    {debugInfo.errors.map((error: string, index: number) => (
                      <div key={index} className="text-sm text-red-600 dark:text-red-400 font-mono bg-red-100 dark:bg-red-900/30 p-2 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={runDiagnostics}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                >
                  Re-run Diagnostics
                </button>
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Copy Results
                </button>
              </div>

              {/* Raw Data */}
              <details className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <summary className="font-semibold cursor-pointer">Raw Debug Data</summary>
                <pre className="mt-3 text-xs overflow-x-auto bg-gray-100 dark:bg-gray-800 p-3 rounded">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            </>
          )}
        </div>
      </div>
    </div>
  );
};