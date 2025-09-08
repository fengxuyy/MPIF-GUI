import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './ui/button';
import { Loader2, AlertCircle, Plus, Upload } from 'lucide-react';

interface IntroPageProps {
  onCreate: () => void;
  onFileUpload: (content: string, fileName: string) => void;
}

const IntroPage: React.FC<IntroPageProps> = ({ onCreate, onFileUpload }) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.mpif')) {
      setErrorMessage('Please upload a .mpif file');
      setUploadStatus('error');
      return;
    }

    setUploadStatus('loading');
    setErrorMessage('');

    try {
      const content = await file.text();
      if (!content.includes('data_') && !content.includes('_mpif_')) {
        throw new Error('File does not appear to be a valid MPIF file');
      }
      setTimeout(() => onFileUpload(content, file.name), 500);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to read file');
      setUploadStatus('error');
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: {
      'text/plain': ['.mpif'],
      'application/octet-stream': ['.mpif']
    },
    maxFiles: 1,
  });

  const handleUploadClick = () => {
    setUploadStatus('idle');
    setErrorMessage('');
    open();
  }

  return (
    <div {...getRootProps()} className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 focus:outline-none overflow-hidden">
      <input {...getInputProps()} />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative flex flex-col items-center justify-center min-h-screen px-4">
        {/* Hero Section */}
        <div className="text-center mb-12 max-w-4xl">
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-6">
            MPIF Dashboard
          </h1>
          
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Create, edit, and manage MPIF files with precision and ease. Built for researchers, by researchers.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-4xl w-full">
          {/* Upload Card */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-200">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-xl mb-6">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Upload Existing File
              </h3>
              
              <p className="text-slate-600 mb-6 leading-relaxed h-12">
                Load and edit your existing MPIF files
              </p>
              
              <Button 
                onClick={handleUploadClick} 
                size="lg" 
                disabled={uploadStatus === 'loading'}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {uploadStatus === 'loading' && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {uploadStatus === 'loading' ? 'Processing...' : 'Choose File'}
              </Button>
            </div>
          </div>

          {/* Create Card */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-200">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-xl mb-6">
                <Plus className="w-8 h-8 text-purple-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Create New File
              </h3>
              
              <p className="text-slate-600 mb-6 leading-relaxed h-12">
                Start fresh with a new MPIF file
              </p>
              
              <Button 
                onClick={onCreate} 
                variant="outline" 
                size="lg" 
                disabled={uploadStatus === 'loading'}
                className="w-full border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Creating
              </Button>
            </div>
          </div>
        </div>


        {/* Error Display */}
        {uploadStatus === 'error' && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl max-w-md w-full">
            <div className="flex items-center justify-center text-red-600">
              <AlertCircle className="mr-2 h-5 w-5" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default IntroPage;
