import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Loader2, AlertCircle, Plus, FileUp, Github, FolderOpen, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface IntroPageProps {
  onCreate: () => void;
  onFileUpload: (content: string, fileName: string) => void;
  onLoadDraft?: () => void;
  draftInfo?: { fileName?: string; savedAt: string } | null;
}

// ---------------------------------------------------------------------------
// ORCID ID icon (official SVG logo)
// ---------------------------------------------------------------------------
function OrcidIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 256 256"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="ORCID iD"
    >
      <path
        d="M256 128c0 70.7-57.3 128-128 128S0 198.7 0 128 57.3 0 128 0s128 57.3 128 128z"
        fill="#A6CE39"
      />
      <path
        d="M86.3 186.2H70.9V79.1h15.4v107.1zM108.9 79.1h41.6c39.6 0 57 28.3 57 53.6 0 27.5-21.5 53.6-56.8 53.6h-41.8V79.1zm15.4 93.3h24.5c34.9 0 42.9-26.5 42.9-39.7C191.7 111.2 178 93 148 93h-23.7v79.4zM88.7 56.8c0 5.5-4.5 10.1-10.1 10.1s-10.1-4.6-10.1-10.1c0-5.6 4.5-10.1 10.1-10.1s10.1 4.6 10.1 10.1z"
        fill="#fff"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// User badge shown when logged in
// ---------------------------------------------------------------------------
function UserBadge({ onLogout }: { onLogout: () => void }) {
  const user = useAuthStore((s) => s.user)!;
  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'OR';

  return (
    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full shadow-md px-4 py-2 border border-slate-200">
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
        style={{ backgroundColor: '#A6CE39' }}
      >
        {initials}
      </div>

      <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold text-slate-800 leading-none">{user.name || 'Researcher'}</span>
        <a
          href={`https://orcid.org/${user.orcid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#A6CE39] hover:underline font-mono"
        >
          {user.orcid}
        </a>
      </div>

      <button
        onClick={onLogout}
        title="Logout"
        className="ml-1 p-1.5 rounded-full text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
const IntroPage: React.FC<IntroPageProps> = ({ onCreate, onFileUpload, onLoadDraft, draftInfo }) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const user   = useAuthStore((s) => s.user);
  const login  = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const authError = useAuthStore((s) => s.error);

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
  };

  return (
    <div {...getRootProps()} className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 focus:outline-none overflow-hidden">
      <input {...getInputProps()} />

      {/* Top-right controls */}
      <div className="absolute top-6 right-6 z-10 flex items-center gap-3">
        {/* User badge or ORCID login */}
        {user ? (
          <UserBadge onLogout={logout} />
        ) : (
          <button
            id="orcid-login-btn"
            onClick={login}
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-4 py-2 border border-slate-200 group"
            title="Login with your ORCID iD"
          >
            <OrcidIcon className="h-7 w-7 flex-shrink-0" />
            <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors whitespace-nowrap">
              Login with ORCID
            </span>
          </button>
        )}

        {/* GitHub link */}
        <a
          href="https://github.com/fengxuyy/MSIF-GUI"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
          title="View on GitHub"
        >
          <Github className="h-6 w-6 text-gray-700 group-hover:text-gray-900 transition-colors" />
        </a>
      </div>

      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative flex flex-col items-center justify-center min-h-screen px-4">
        {/* Hero */}
        <div className="text-center mb-12 max-w-4xl">
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-6">
            MPIF Dashboard
          </h1>

          {user ? (
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Welcome back, <span className="font-semibold text-slate-700">{user.name}</span>.
            </p>
          ) : (
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Create, edit, and manage MPIF files with precision and ease. Built for researchers, by researchers.
            </p>
          )}
        </div>

        {/* Action cards */}
        <div className={`grid gap-8 mb-12 w-full ${draftInfo ? 'md:grid-cols-3 max-w-6xl' : 'md:grid-cols-2 max-w-4xl'}`}>
          {/* Upload Card */}
          <div
            className="group relative cursor-pointer"
            onClick={uploadStatus === 'loading' ? undefined : handleUploadClick}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-200">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-xl mb-6">
                <FileUp className="w-8 h-8 text-blue-600" />
              </div>

              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Upload Existing File
              </h3>

              <p className="text-slate-600 mb-6 leading-relaxed">
                Load and edit your existing MPIF files
                {uploadStatus === 'loading' && (
                  <span className="block mt-2 text-blue-600 font-medium">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                    Processing...
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Create Card */}
          <div
            className="group relative cursor-pointer"
            onClick={uploadStatus === 'loading' ? undefined : onCreate}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-200">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-xl mb-6">
                <Plus className="w-8 h-8 text-purple-600" />
              </div>

              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Create New File
              </h3>

              <p className="text-slate-600 mb-6 leading-relaxed">
                Start fresh with a new MPIF file
              </p>
            </div>
          </div>

          {draftInfo && onLoadDraft && (
            <div
              className="group relative cursor-pointer"
              onClick={uploadStatus === 'loading' ? undefined : onLoadDraft}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-200">
                <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-xl mb-6">
                  <FolderOpen className="w-8 h-8 text-emerald-600" />
                </div>

                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  Continue Saved Draft
                </h3>

                <p className="text-slate-600 mb-2 leading-relaxed">
                  {draftInfo.fileName || 'Browser draft'}
                </p>
                <p className="text-sm text-slate-500">
                  Saved {new Date(draftInfo.savedAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ORCID auth error */}
        {authError && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl max-w-md w-full">
            <div className="flex items-start gap-2 text-amber-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{authError}</span>
            </div>
          </div>
        )}

        {/* File upload error */}
        {uploadStatus === 'error' && (
          <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded-xl max-w-md w-full">
            <div className="flex items-center justify-center text-red-600">
              <AlertCircle className="mr-2 h-5 w-5" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Login hint when not logged in */}
        {!user && (
          <p className="mt-4 text-xs text-slate-400 text-center max-w-sm">
            Tip: Login with ORCID to auto-fill your researcher profile in the Metadata section.
          </p>
        )}
      </div>
    </div>
  );
};

export default IntroPage;
