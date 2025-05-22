
import React, { useState, useCallback, useRef } from 'react';

interface ImageUploadProps {
  onImageUpload: (base64Image: string, file: File) => void;
  maxFileSizeMB?: number;
  acceptedFileTypes?: string[]; // e.g., ['image/jpeg', 'image/png']
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageUpload, 
  maxFileSizeMB = 5,
  acceptedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] 
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError(null);
      setFileName(null);

      if (!acceptedFileTypes.includes(file.type)) {
        setError(`Invalid file type. Please upload one of: ${acceptedFileTypes.join(', ')}.`);
        setPreview(null);
        if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
        return;
      }

      if (file.size > maxFileSizeMB * 1024 * 1024) {
        setError(`File is too large. Maximum size is ${maxFileSizeMB}MB.`);
        setPreview(null);
        if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setFileName(file.name);
        onImageUpload(reader.result as string, file);
      };
      reader.onerror = () => {
        setError("Failed to read file.");
        setPreview(null);
      }
      reader.readAsDataURL(file);
    }
  }, [onImageUpload, maxFileSizeMB, acceptedFileTypes]);

  const handleRemoveImage = () => {
    setPreview(null);
    setFileName(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset the file input
    }
    // Potentially call a prop to notify parent about image removal
  };

  return (
    <div className="space-y-4">
      <div className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-primary transition-colors">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={acceptedFileTypes.join(',')}
          className="hidden"
          id="imageUploadInput"
        />
        <label htmlFor="imageUploadInput" className="cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            <span className="font-medium text-primary">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            {acceptedFileTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} up to {maxFileSizeMB}MB
          </p>
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      
      {preview && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg shadow-sm relative">
          <p className="text-sm font-medium text-gray-700 mb-2">Preview: {fileName}</p>
          <img src={preview} alt="Preview" className="max-w-full h-auto max-h-80 rounded-md object-contain mx-auto" />
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
            aria-label="Remove image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
    