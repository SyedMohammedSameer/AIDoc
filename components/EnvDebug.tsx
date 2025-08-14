// components/EnvDebug.tsx - Temporary component to debug environment variables
import React from 'react';

const EnvDebug: React.FC = () => {
  if (import.meta.env.PROD) {
    return null;
  }

  const envVars = {
    'VITE_GEMINI_API_KEY': import.meta.env.VITE_GEMINI_API_KEY,
    'VITE_FIREBASE_API_KEY': import.meta.env.VITE_FIREBASE_API_KEY,
    'VITE_FIREBASE_AUTH_DOMAIN': import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    'VITE_FIREBASE_PROJECT_ID': import.meta.env.VITE_FIREBASE_PROJECT_ID,
    'VITE_FIREBASE_STORAGE_BUCKET': import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    'VITE_FIREBASE_MESSAGING_SENDER_ID': import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    'VITE_FIREBASE_APP_ID': import.meta.env.VITE_FIREBASE_APP_ID
  };
  
  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-md text-xs z-50">
      <h3 className="font-bold mb-2">🔧 Environment Debug</h3>
      <div className="space-y-1">
        <div>Mode: {import.meta.env.MODE} | Dev: {import.meta.env.DEV ? 'Yes' : 'No'}</div>
        <div className="mt-2">
          <strong>Key Variables:</strong>
          {Object.entries(envVars).map(([key, value]) => (
            <div key={key} className="ml-2">
              {key}: {value ? `✅ ${value.substring(0, 10)}...` : '❌ Missing'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnvDebug;