import { useEffect, useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Package,
  Beaker,
  Settings,
  Download,
  CheckCircle,
  Database,
  Columns,
  ChevronDown,
  BookOpen,
  Plus,
  FileUp,
  Save,
  LogOut,
  Sun,
  Moon,
  Home,
  CheckCircle2,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { MetadataForm } from './forms/MetadataForm';
import { ProductInfoForm } from './forms/ProductInfoForm';
import { SynthesisGeneralForm } from './forms/SynthesisGeneralForm.tsx';
import { SynthesisDetailsForm } from './forms/SynthesisDetailsForm';
import { CharacterizationForm } from './forms/CharacterizationForm';
import { MPIFData } from '@/types/mpif';
import { useMPIFStore } from '@/store/mpifStore';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { savePublishedFile } from '@/store/publishedFilesStore';

interface DashboardProps {
  className?: string;
}

const sidebarSections = [
  {
    id: 'metadata',
    label: 'Metadata',
    icon: FileText,
    description: 'File audit details & attribution'
  },
  {
    id: 'productInfo',
    label: 'Product Info',
    icon: Package,
    description: 'Material properties & specs'
  },
  {
    id: 'synthesisGeneral',
    label: 'Synthesis General',
    icon: Beaker,
    description: 'Reaction conditions & params'
  },
  {
    id: 'synthesisDetails',
    label: 'Synthesis Details',
    icon: Settings,
    description: 'Reagents, equip & procedure'
  },
  {
    id: 'characterization',
    label: 'Characterization',
    icon: Database,
    description: 'Analytical measurements'
  }
];

const isSectionUnfilled = (section: string, data: any): boolean => {
  if (!data || !data[section]) return true;
  const secData = data[section];

  if (section === 'metadata') {
    return !secData.dataName && !secData.name && !secData.email && !secData.orcid && !secData.address && !secData.phone && !secData.publicationDOI && !secData.procedureStatus;
  }
  if (section === 'productInfo') {
    return !secData.commonName && !secData.casNumber && !secData.type && !secData.ccdcNumber && !secData.systematicName && !secData.formula && !secData.state && !secData.color;
  }
  if (section === 'synthesisGeneral') {
    return secData.labTemperature === undefined && secData.labHumidity === undefined && !secData.reactionType && secData.reactionTemperature === undefined && !secData.temperatureController && secData.reactionTime === undefined && !secData.reactionAtmosphere && !secData.reactionContainer && !secData.reactionNote && secData.productAmount === undefined && secData.productYield === undefined && !secData.scale && !secData.safetyNote;
  }
  if (section === 'synthesisDetails') {
    return (!secData.substrates || secData.substrates.length === 0) &&
           (!secData.solvents || secData.solvents.length === 0) &&
           (!secData.vessels || secData.vessels.length === 0) &&
           (!secData.hardware || secData.hardware.length === 0) &&
           (!secData.steps || secData.steps.length === 0) &&
           (!secData.procedureFull || !secData.procedureFull.trim());
  }
  if (section === 'characterization') {
    return (!secData.pxrd || !secData.pxrd.data || secData.pxrd.data.length === 0) &&
           (!secData.tga || !secData.tga.data || secData.tga.data.length === 0) &&
           (!secData.aif || Object.keys(secData.aif).length === 0) &&
           (!secData.cif || Object.keys(secData.cif).length === 0) &&
           (!secData.nmr) && (!secData.ir) && (!secData.sem);
  }
  return false;
};

export function Dashboard({ className }: DashboardProps) {
  const navigate = useNavigate();
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFileName, setExportFileName] = useState('');
  const [exportFormat, setExportFormat] = useState<'mpif' | 'json'>('mpif');
  const [draftMessage, setDraftMessage] = useState('');
  const [floatingMessage, setFloatingMessage] = useState<string | null>(null);

  const orcidUser = useAuthStore((s) => s.user);
  const orcidLogout = useAuthStore((s) => s.logout);
  const { theme, toggleTheme } = useThemeStore();

  const {
    mpifData,
    dashboard,
    fileState,
    validation,
    setCurrentSection,
    setShowValidationErrors,
    validateData,
    exportMPIF,
    loadMPIFFile,
    updateSection,
    createNewMPIF,
    clearUnsavedChanges,
    setColumnLayout,
    saveDraft
  } = useMPIFStore();

  const readOnly = (dashboard as any).readOnly;

  // Redirect to home page if no MPIF data is loaded (on refresh)
  useEffect(() => {
    if (!mpifData) {
      navigate('/');
    }
  }, [mpifData, navigate]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.name.toLowerCase().endsWith('.mpif')) {
      try {
        const content = await file.text();
        if (!content.includes('data_') && !content.includes('_mpif_')) {
          throw new Error('File does not appear to be a valid MPIF file');
        }
        await loadMPIFFile(content, file.name);
      } catch (error) {
        console.error('File upload error:', error);
      }
    } else {
      console.error('Invalid file type. Please upload an MPIF file');
    }
  }, [loadMPIFFile]);

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

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (dashboard.hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = ''; // For Chrome
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [dashboard.hasUnsavedChanges]);

  useEffect(() => {
    if (!floatingMessage) return;

    const timeoutId = window.setTimeout(() => {
      setFloatingMessage(null);
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [floatingMessage]);

  const handleCreateNewMPIF = () => {
    const performCreate = () => {
      createNewMPIF();
    };

    if (dashboard.hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes that will be lost. Are you sure you want to create a new file?')) {
        performCreate();
      }
    } else if (mpifData) {
      if (window.confirm('This will discard the current file and create a new one. Are you sure?')) {
        performCreate();
      }
    } else {
      performCreate();
    }
  };

  const handleGoHome = () => {
    if (dashboard.hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes that will be lost. Are you sure you want to go back to the home page?')) {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  const handleUploadClick = () => {
    if (dashboard.hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes that will be lost. Are you sure?')) {
        open();
      }
    } else if (mpifData) {
      if (window.confirm('This will replace the current file. Are you sure?')) {
        open();
      }
    } else {
      open();
    }
  };

  const flushAndSaveDraft = (afterSave?: () => void) => {
    (document.activeElement as HTMLElement)?.blur();

    window.setTimeout(() => {
      saveDraft();
      setDraftMessage('Draft saved');
      window.setTimeout(() => setDraftMessage(''), 2500);
      afterSave?.();
    }, 700);
  };

  const handleSaveDraft = () => {
    flushAndSaveDraft();
  };

  const handleDocumentationNavigation = () => {
    if (dashboard.hasUnsavedChanges) {
      if (!window.confirm('Save a draft before opening Documentation?')) {
        return;
      }
      flushAndSaveDraft(() => navigate('/documentation'));
      return;
    }

  };

  const handleExportClick = () => {
    const currentFileName = fileState.fileName || 'untitled';
    const fileNameWithoutExt = currentFileName.endsWith('.mpif')
      ? currentFileName.slice(0, -5)
      : currentFileName;
    setExportFileName(fileNameWithoutExt);
    setExportFormat('mpif');
    setExportDialogOpen(true);
  };

  const handleExportJSONClick = () => {
    const currentFileName = fileState.fileName || 'untitled';
    const fileNameWithoutExt = currentFileName.replace(/\.(mpif|json)$/, '');
    setExportFileName(fileNameWithoutExt);
    setExportFormat('json');
    setExportDialogOpen(true);
  };

  const handleDownloadReadOnly = () => {
    if (!mpifData) return;
    const content = exportMPIF();
    const baseName = (fileState.fileName || 'published').replace(/\.(mpif|json)$/, '');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseName}.mpif`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    (document.activeElement as HTMLElement)?.blur();

    setTimeout(async () => {
      try {
        let exportedContent = '';
        let finalFileName = '';

        if (exportFormat === 'json') {
          if (!mpifData) throw new Error('No data to export');

          const exportValidation = validateData();
          const hasExportErrors = !exportValidation.isValid;
          setShowValidationErrors(hasExportErrors);

          if (hasExportErrors) {
            setExportDialogOpen(false);
            setFloatingMessage(`Required fields are missing. Please complete the highlighted fields before exporting (${exportValidation.errors.length} issue${exportValidation.errors.length === 1 ? '' : 's'}).`);
            return;
          }

          exportedContent = JSON.stringify(mpifData, null, 2);
          finalFileName = exportFileName.trim() ? `${exportFileName.trim()}.json` : 'untitled.json';

          const blob = new Blob([exportedContent], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = finalFileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else {
          exportedContent = exportMPIF();
          finalFileName = exportFileName.trim() ? `${exportFileName.trim()}.mpif` : 'untitled.mpif';

          const blob = new Blob([exportedContent], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = finalFileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }

        clearUnsavedChanges();
        setShowValidationErrors(false);
        setFloatingMessage(null);
        setExportDialogOpen(false);

        if (mpifData && exportedContent && window.confirm('Is this file publishable and should it be saved to the database?')) {
          if (!orcidUser) {
            setFloatingMessage('Please connect your ORCID iD before saving publishable files to the database.');
            return;
          }

          try {
            const publishedRecord = await savePublishedFile({
              fileName: finalFileName,
              format: exportFormat,
              content: exportedContent,
              mpifData,
              author: orcidUser,
            });

            setFloatingMessage(
              publishedRecord.doi
                ? `Publishable file saved to the database — DOI: ${publishedRecord.doi}`
                : 'Publishable file saved to the database.'
            );
          } catch (saveError) {
            console.error('Database save failed:', saveError);
            setFloatingMessage('Export completed, but saving to the database failed. Please make sure the backend API is running.');
          }
        }
      } catch (error) {
        console.error('Export failed:', error);
        setExportDialogOpen(false);

        const message = error instanceof Error
          ? error.message
          : 'Required fields are missing. Please complete the highlighted fields before exporting.';

        setFloatingMessage(
          message.includes('validation errors')
            ? 'Required fields are missing. Please complete the highlighted fields before exporting.'
            : message
        );
      }
    }, 700);
  };

  const renderSectionForm = () => {
    if (!mpifData) return null;

    const sectionErrors = dashboard.showValidationErrors
      ? validation.errors.filter((error: any) => error.section === dashboard.currentSection)
      : [];

    const commonProps = {
      onSave: (data: any) => updateSection(dashboard.currentSection as keyof MPIFData, data),
      onUnsavedChange: () => {},
      errors: sectionErrors
    };

    switch (dashboard.currentSection) {
      case 'metadata':
        return <MetadataForm data={mpifData.metadata} {...commonProps} />;
      case 'productInfo':
        return <ProductInfoForm data={mpifData.productInfo} {...commonProps} />;
      case 'synthesisGeneral':
        return <SynthesisGeneralForm data={mpifData.synthesisGeneral} {...commonProps} />;
      case 'synthesisDetails':
        return <SynthesisDetailsForm data={mpifData.synthesisDetails} {...commonProps} />;
      case 'characterization':
        return <CharacterizationForm data={mpifData.characterization} {...commonProps} />;
      default:
        return (
          <div className="p-8 glass-panel rounded-xl border border-zinc-200 dark:border-zinc-800 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-mono">
              Form for section [{dashboard.currentSection}] is under development.
            </p>
          </div>
        );
    }
  };

  const currentSectionData = sidebarSections.find(s => s.id === dashboard.currentSection);

  return (
    <div {...getRootProps()} className={cn('flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans overflow-hidden transition-colors duration-300 relative focus:outline-none', className)}>
      <input {...getInputProps()} />

      {floatingMessage && (
        <div className="absolute top-4 left-1/2 z-50 -translate-x-1/2 pointer-events-none">
          <div className="rounded-xl border border-amber-300/80 bg-amber-50/95 px-4 py-3 text-sm font-medium text-amber-950 shadow-lg backdrop-blur dark:border-amber-700/80 dark:bg-amber-950/90 dark:text-amber-100">
            {floatingMessage}
          </div>
        </div>
      )}

      {/* Subtle scientific dot grid background */}
      <div className="absolute inset-0 intro-dot-grid pointer-events-none opacity-30"></div>

      {/* Fixed-Width Scientific Sidebar */}
      <aside className="relative z-20 w-64 border-r border-zinc-200 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md flex flex-col justify-between flex-shrink-0 transition-all">
        <div>
          {/* Brand Header */}
          <div className="h-16 px-6 border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={handleGoHome}>
              <img src="/icon.png" alt="MPIF Logo" className="w-7 h-7 rounded-lg object-contain" />
              <span className="font-geist font-bold tracking-tight text-sm text-zinc-900 dark:text-white leading-tight">Material Preparation Information File</span>
            </div>
          </div>

          {/* Section Navigation */}
          <div className="p-3 space-y-1.5">
            <div className="px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
              Schema Sections
            </div>
            {sidebarSections.map((section) => {
              const Icon = section.icon;
              const isActive = dashboard.currentSection === section.id;
              const sectionErrorCount = dashboard.showValidationErrors
                ? validation.errors.filter((e: any) => e.section === section.id).length
                : 0;

              return (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(section.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-all duration-200 ease-out group cursor-pointer border',
                    isActive
                      ? 'border-purple-300 bg-purple-300 text-purple-950 shadow-sm shadow-purple-500/15 dark:border-purple-500 dark:bg-purple-500 dark:text-zinc-950'
                      : 'border-transparent text-zinc-700 hover:-translate-y-px hover:border-zinc-200 hover:bg-white hover:text-zinc-950 hover:shadow-sm dark:text-zinc-300 dark:hover:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-white font-medium'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-purple-950 dark:text-zinc-950' : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white')} />
                    <div className="truncate">
                      <div className="text-xs leading-tight truncate">{section.label}</div>
                      <div className={cn('text-[10px] truncate mt-0.5 font-normal', isActive ? 'text-purple-900 dark:text-zinc-950/65' : 'text-zinc-400 dark:text-zinc-500')}>
                        {section.description}
                      </div>
                    </div>
                  </div>

                  {sectionErrorCount > 0 && (
                    <span className={cn(
                      'text-[10px] font-mono px-1.5 py-0.5 rounded-full flex-shrink-0 ml-2 border',
                      isActive
                        ? 'bg-white/20 dark:bg-zinc-950/20 text-white dark:text-zinc-950 border-white/30 dark:border-zinc-950/30'
                        : 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/60'
                    )}>
                      {sectionErrorCount}
                    </span>
                  )}
                  {sectionErrorCount === 0 && !isActive && !isSectionUnfilled(section.id, mpifData) && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 opacity-80 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer / Quick Tools */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/80 space-y-1">
          <button
            onClick={handleGoHome}
            className="w-full flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left text-xs font-medium text-zinc-600 transition-all duration-200 ease-out hover:-translate-y-px hover:border-zinc-200 hover:bg-white hover:text-zinc-900 hover:shadow-sm dark:text-zinc-400 dark:hover:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-white cursor-pointer"
          >
            <Home className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            <span>Home Page</span>
          </button>
          <button
            onClick={handleDocumentationNavigation}
            className="w-full flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left text-xs font-medium text-zinc-600 transition-all duration-200 ease-out hover:-translate-y-px hover:border-zinc-200 hover:bg-white hover:text-zinc-900 hover:shadow-sm dark:text-zinc-400 dark:hover:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-white cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            <span>Documentation</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">

        {/* Top Navigation Header */}
        <header className="h-16 px-6 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-between flex-shrink-0">

          {/* Active Section Info */}
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800/50 flex items-center justify-center text-purple-500 dark:text-purple-400">
              {currentSectionData && <currentSectionData.icon className="h-4 w-4" />}
            </div>
            <div>
              <h1 className="font-geist font-bold text-sm sm:text-base text-zinc-900 dark:text-white leading-tight">
                {currentSectionData?.label || 'Dashboard'}
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-none mt-0.5 hidden sm:block">
                {currentSectionData?.description || 'Select a schema section to edit'}
              </p>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2.5 sm:gap-3">

            {/* Document Status Indicator */}
            <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 glass-panel rounded-full border border-zinc-200 dark:border-zinc-800/80 text-xs">
              <FileText className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400 flex-shrink-0" />
              <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200 max-w-[150px] truncate">
                {fileState.fileName || 'untitled.mpif'}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              {readOnly ? (
                <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
                  <Eye className="w-3.5 h-3.5" />
                  Read-only
                </span>
              ) : dashboard.hasUnsavedChanges ? (
                <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  Unsaved
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {draftMessage || 'Saved'}
                </span>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="rounded-lg border border-zinc-300 bg-white p-2.5 text-zinc-600 shadow-sm transition-all duration-200 ease-out hover:-translate-y-px hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-950 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-white cursor-pointer"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            {/* Layout Columns Toggle */}
            <button
              onClick={() => setColumnLayout((dashboard as any).columnLayout === 'double' ? 'single' : 'double')}
              className="hidden sm:flex rounded-lg border border-zinc-300 bg-white p-2.5 text-zinc-600 shadow-sm transition-all duration-200 ease-out hover:-translate-y-px hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-950 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-white cursor-pointer"
              title="Toggle Grid Columns Layout"
            >
              <Columns className="h-4 w-4" />
            </button>

            {/* Read-only: single Download action, editing controls hidden */}
            {readOnly ? (
              <Button
                variant="default"
                size="sm"
                onClick={handleDownloadReadOnly}
                disabled={!mpifData}
                className="h-9 px-3.5"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                <span>Download</span>
              </Button>
            ) : (
            <>
            {/* Save Draft Action */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={!mpifData}
              className="h-9 px-3.5"
            >
              <Save className="h-3.5 w-3.5 mr-1.5 text-purple-500 dark:text-purple-400" />
              <span>Save</span>
            </Button>

            {/* Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="h-9 px-3.5"
                >
                  <span>Actions</span>
                  <ChevronDown className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1.5 shadow-xl font-sans">
                <DropdownMenuItem onClick={handleCreateNewMPIF} className="rounded-lg text-xs py-2 px-3 cursor-pointer text-zinc-700 dark:text-zinc-300 focus:bg-zinc-100 dark:focus:bg-zinc-800">
                  <Plus className="h-3.5 w-3.5 mr-2.5 text-purple-500 dark:text-purple-400" />
                  New File
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleUploadClick} className="rounded-lg text-xs py-2 px-3 cursor-pointer text-zinc-700 dark:text-zinc-300 focus:bg-zinc-100 dark:focus:bg-zinc-800">
                  <FileUp className="h-3.5 w-3.5 mr-2.5 text-purple-500 dark:text-purple-400" />
                  Upload MPIF
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800 my-1" />
                <DropdownMenuItem onClick={handleExportClick} disabled={!mpifData} className="rounded-lg text-xs py-2 px-3 cursor-pointer text-zinc-700 dark:text-zinc-300 focus:bg-zinc-100 dark:focus:bg-zinc-800 font-medium">
                  <Download className="h-3.5 w-3.5 mr-2.5 text-emerald-600 dark:text-emerald-400" />
                  Export MPIF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportJSONClick} disabled={!mpifData} className="rounded-lg text-xs py-2 px-3 cursor-pointer text-zinc-700 dark:text-zinc-300 focus:bg-zinc-100 dark:focus:bg-zinc-800 font-medium">
                  <Download className="h-3.5 w-3.5 mr-2.5 text-emerald-600 dark:text-emerald-400" />
                  Export JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </>
            )}

            {/* Researcher Chip */}
            {orcidUser && (
              <div className="hidden sm:flex items-center gap-2 glass-panel rounded-full border border-zinc-200 dark:border-zinc-800/80 px-2.5 py-1 text-xs group">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-950 text-[10px] font-bold flex-shrink-0"
                  style={{ backgroundColor: '#A6CE39' }}
                >
                  {orcidUser.name
                    ? orcidUser.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
                    : 'OR'}
                </div>
                <span className="font-medium text-zinc-800 dark:text-zinc-200 text-xs max-w-[100px] truncate">{orcidUser.name || 'Researcher'}</span>
                <button
                  onClick={orcidLogout}
                  title="Disconnect ORCID"
                  className="p-1 rounded-full text-zinc-400 hover:text-red-500 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3 w-3" />
                </button>
              </div>
            )}

          </div>

        </header>

        {/* Scrollable Form Content Area */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-10">
          <div className="max-w-5xl mx-auto pb-20">
            {/* Active Form Rendering */}
            <div className="transition-all duration-300">
              {renderSectionForm()}
            </div>
          </div>
        </main>

      </div>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 font-sans">
          <DialogHeader>
            <DialogTitle className="font-geist text-lg font-bold text-zinc-900 dark:text-white">
              {exportFormat === 'json' ? 'Export JSON' : 'Export MPIF'}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              {exportFormat === 'json'
                ? 'Enter filename for JSON export (compatible with Python materials analysis backend)'
                : 'Enter filename for MPIF export. The .mpif extension will be appended automatically.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="filename" className="text-zinc-700 dark:text-zinc-300">
                Document Filename
              </Label>
              <Input
                id="filename"
                value={exportFileName}
                onChange={(e) => setExportFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && exportFileName.trim()) {
                    handleExport();
                  }
                }}
                placeholder="e.g. Specimen_B4C_Sintered"
                autoFocus
                className="font-mono text-xs"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setExportDialogOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleExport}
              disabled={!exportFileName.trim()}
              className="text-xs"
            >
              Confirm Export ({exportFormat === 'json' ? '.json' : '.mpif'})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default Dashboard;
