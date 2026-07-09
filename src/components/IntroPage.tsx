import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Loader2,
  AlertCircle,
  Plus,
  FileUp,
  Github,
  FolderOpen,
  LogOut,
  ArrowRight,
  CheckCircle2,
  Database,
  ShieldCheck,
  FileText,
  Layers,
  Sun,
  Moon
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';

interface IntroPageProps {
  onCreate: () => void;
  onFileUpload: (content: string, fileName: string) => void;
  onOpenDatabase: () => void;
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
// User badge shown when logged in (Dual light/dark aesthetic)
// ---------------------------------------------------------------------------
function UserBadge({ onLogout }: { onLogout: () => void }) {
  const user = useAuthStore((s) => s.user)!;
  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'OR';

  return (
    <div className="flex items-center gap-3 glass-panel rounded-full px-4 py-2 border border-zinc-200 dark:border-zinc-800/80">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-950 text-xs font-bold flex-shrink-0"
        style={{ backgroundColor: '#A6CE39' }}
      >
        {initials}
      </div>

      <div className="flex flex-col leading-tight text-left">
        <span className="text-xs font-medium text-zinc-900 dark:text-zinc-200 leading-none">{user.name || 'Researcher'}</span>
        <a
          href={`https://orcid.org/${user.orcid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-[#7d9c29] dark:text-[#A6CE39] hover:underline font-mono mt-0.5"
        >
          {user.orcid}
        </a>
      </div>

      <button
        onClick={onLogout}
        title="Logout"
        className="ml-1 p-1.5 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
      >
        <LogOut className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scientific Specimen Showcase (Right-hand visual asset)
// ---------------------------------------------------------------------------
function ScientificSpecimenVisual() {
  return (
    <div className="relative w-full max-w-md mx-auto lg:max-w-none intro-icon-float select-none">
      {/* Glow behind panel */}
      <div className="absolute -inset-1 bg-gradient-to-tr from-purple-500/20 via-fuchsia-500/10 to-transparent rounded-2xl blur-xl opacity-70"></div>

      {/* Main glass visual panel */}
      <div className="relative glass-panel rounded-2xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-4 mb-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800/50 flex items-center justify-center text-purple-500 dark:text-purple-400">
              <Database className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-zinc-800 dark:text-zinc-300">Material Preparation Information File Specification</div>
              <div className="text-[11px] text-zinc-500 font-mono">Standardized Materials File</div>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300/80 dark:border-purple-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400 animate-pulse"></span>
            Valid Schema
          </span>
        </div>

        {/* Structured data node simulation */}
        <div className="space-y-3.5 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-zinc-100/90 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-zinc-800 dark:text-zinc-300">
              <FileText className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
              <span>Material Metadata</span>
            </div>
            <span className="text-zinc-500">Standardized</span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-100/90 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-zinc-800 dark:text-zinc-300">
              <Layers className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
              <span>Synthesis Route</span>
            </div>
            <span className="text-zinc-500">Structured</span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-100/90 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-zinc-800 dark:text-zinc-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
              <span>Characterization Data</span>
            </div>
            <span className="text-zinc-500">Verified</span>
          </div>
        </div>

        {/* Bottom specification footer */}
        <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Machine-readable formatting</span>
          <span className="font-mono text-purple-700 dark:text-purple-400/80">JSON / CIF Compatible</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
const IntroPage: React.FC<IntroPageProps> = ({ onCreate, onFileUpload, onOpenDatabase, onLoadDraft, draftInfo }) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const user   = useAuthStore((s) => s.user);
  const login  = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const authError = useAuthStore((s) => s.error);

  const { theme, toggleTheme } = useThemeStore();

  const requireOrcid = useCallback(() => {
    if (user) return true;

    setErrorMessage('Please connect your ORCID iD before creating, uploading, or restoring MPIF files.');
    setUploadStatus('error');
    login();
    return false;
  }, [login, user]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!requireOrcid()) return;

    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.mpif')) {
      setErrorMessage('Please upload a valid MPIF file.');
      setUploadStatus('error');
      return;
    }

    setUploadStatus('loading');
    setErrorMessage('');

    try {
      const content = await file.text();
      if (!content.includes('data_') && !content.includes('_mpif_')) {
        throw new Error('The file structure does not match the MPIF format.');
      }
      setTimeout(() => onFileUpload(content, file.name), 500);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to parse file.');
      setUploadStatus('error');
    }
  }, [onFileUpload, requireOrcid]);

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
    if (!requireOrcid()) return;

    setUploadStatus('idle');
    setErrorMessage('');
    open();
  };

  const handleCreateClick = () => {
    if (!requireOrcid() || uploadStatus === 'loading') return;
    onCreate();
  };

  const handleLoadDraftClick = () => {
    if (!requireOrcid() || uploadStatus === 'loading') return;
    onLoadDraft?.();
  };

  return (
    <div {...getRootProps()} className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans relative overflow-hidden flex flex-col justify-between focus:outline-none transition-colors duration-300">
      <input {...getInputProps()} />

      {/* Background dot grid & restrained glow */}
      <div className="absolute inset-0 intro-dot-grid pointer-events-none opacity-40"></div>
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full filter blur-[140px] pointer-events-none intro-glow"></div>
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full filter blur-[120px] pointer-events-none intro-glow"></div>

      {/* Top Navigation Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/icon.png" alt="MPIF Logo" className="w-8 h-8 rounded-lg object-contain" />
          <span className="font-geist font-bold tracking-tight text-sm text-zinc-900 dark:text-white leading-tight">Material Preparation Information File</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 glass-panel rounded-full border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle color theme"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          {user ? (
            <UserBadge onLogout={logout} />
          ) : (
            <button
              id="orcid-login-btn"
              onClick={login}
              className="flex items-center gap-2 glass-panel rounded-full px-4 py-2 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
              title="Login with your ORCID iD"
            >
              <OrcidIcon className="h-4 w-4 flex-shrink-0" />
              <span>Connect ORCID</span>
            </button>
          )}

          <a
            href="https://github.com/fengxuyy/MSIF-GUI"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 glass-panel rounded-full border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
            title="View source on GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center flex-1">

        {/* Left Column: Copy & Sleek Launchers */}
        <div className="lg:col-span-7 flex flex-col justify-center text-left">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/50 text-purple-800 dark:text-purple-400 text-xs font-medium mb-6 w-fit">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Standardized Materials Informatics</span>
          </div>

          <h1 className="font-geist text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter text-zinc-950 dark:text-white leading-[1.08] mb-6">
            Precision metadata for materials research.
          </h1>

          {user ? (
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-[54ch] leading-relaxed mb-10">
              Welcome back, <span className="text-zinc-900 dark:text-zinc-200 font-medium">{user.name}</span>.
            </p>
          ) : (
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-[54ch] leading-relaxed mb-10">
              Create, validate, and structure Material Preparation Information Files with instant schema verification. Engineered for reproducibility across research teams.
            </p>
          )}

          {/* Sleek Action Launchers */}
          <div className="space-y-4 max-w-xl">
            {/* Create New File Launcher */}
            <button
              onClick={handleCreateClick}
              className="w-full bg-gradient-to-r from-purple-500 via-purple-600 to-fuchsia-600 hover:from-purple-600 hover:via-purple-700 hover:to-fuchsia-700 text-white font-semibold px-6 py-4 rounded-xl flex items-center justify-between group intro-action-btn shadow-lg shadow-purple-500/25 border border-purple-400/30 text-left cursor-pointer transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-base font-bold leading-tight">New File</div>
                  <div className="text-xs text-purple-100 font-normal mt-0.5">Start with a new file</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Upload Existing File Launcher */}
            <button
              onClick={uploadStatus === 'loading' ? undefined : handleUploadClick}
              className="w-full glass-panel hover:bg-white dark:hover:bg-zinc-800/80 text-zinc-900 dark:text-white font-medium px-6 py-4 rounded-xl flex items-center justify-between group transition-all border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-left cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center flex-shrink-0">
                  <FileUp className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-base font-semibold leading-tight text-zinc-900 dark:text-zinc-100">
                    Upload MPIF
                    {uploadStatus === 'loading' && (
                      <span className="ml-2 inline-flex items-center text-xs text-purple-500 dark:text-purple-400 font-normal">
                        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                        Processing...
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 font-normal mt-0.5">Load and edit a saved MPIF document</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Published Database Launcher */}
            <button
              onClick={onOpenDatabase}
              className="w-full bg-white dark:bg-zinc-900/90 hover:bg-purple-50/80 dark:hover:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 hover:border-purple-300 dark:hover:border-purple-700 text-zinc-900 dark:text-white px-6 py-4 rounded-xl flex items-center justify-between group transition-all text-left cursor-pointer shadow-sm shadow-purple-500/10 dark:shadow-none"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center flex-shrink-0">
                  <Database className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                </div>
                <div>
                  <div className="text-base font-semibold leading-tight text-zinc-900 dark:text-zinc-100">Open Database</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 font-normal mt-0.5">Browse saved publishable MPIF files</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-purple-500 dark:text-purple-400/80 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Continue Saved Draft Launcher */}
            {draftInfo && onLoadDraft && (
              <button
                onClick={handleLoadDraftClick}
                className="w-full bg-white dark:bg-zinc-900/90 hover:bg-zinc-50 dark:hover:bg-zinc-800/90 border border-emerald-500/40 dark:border-emerald-500/30 hover:border-emerald-500/60 dark:hover:border-emerald-500/50 text-zinc-900 dark:text-white px-6 py-4 rounded-xl flex items-center justify-between group transition-all text-left cursor-pointer shadow-sm dark:shadow-none"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-base font-semibold leading-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <span>Continue Saved Draft</span>
                      <span className="text-[10px] font-mono uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800/60">
                        Local
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 font-normal mt-0.5 flex items-center gap-2">
                      <span className="truncate max-w-[200px]">{draftInfo.fileName || 'Browser draft'}</span>
                      <span className="text-zinc-400 dark:text-zinc-600">|</span>
                      <span>Saved {new Date(draftInfo.savedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400/80 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-transform group-hover:translate-x-1" />
              </button>
            )}
          </div>

          {/* Feedback & Error States */}
          {authError && (
            <div className="mt-4 p-3.5 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 rounded-xl max-w-xl flex items-start gap-2.5 text-red-700 dark:text-red-300 text-xs">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
              <span>{authError}</span>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="mt-4 p-3.5 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 rounded-xl max-w-xl flex items-center gap-2.5 text-red-700 dark:text-red-300 text-xs">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {!user && (
            <p className="mt-6 text-xs text-zinc-500 dark:text-zinc-500 max-w-xl">
              Tip: Connecting your ORCID account automatically synchronizes author metadata across new records.
            </p>
          )}

        </div>

        {/* Right Column: Visual Showcase */}
        <div className="lg:col-span-5 flex items-center justify-center">
          <ScientificSpecimenVisual />
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 border-t border-zinc-200 dark:border-zinc-900/80 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
        <div className="flex items-center gap-2">
          <span>Material Preparation Information File</span>
          <span className="text-zinc-400 dark:text-zinc-700 font-mono">/</span>
          <span className="text-zinc-600 dark:text-zinc-400">Open Schema</span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="/documentation"
            className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors"
          >
            Documentation
          </a>
          <a
            href="https://github.com/fengxuyy/MSIF-GUI"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors"
          >
            Source
          </a>
        </div>
      </footer>
    </div>
  );
};

export default IntroPage;
