import { useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Package, 
  Beaker,
  Settings, 
  Download,
  Upload,
  AlertTriangle,
  Home,
  Database,
  Columns
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MetadataForm } from './forms/MetadataForm';
import { ProductInfoForm } from './forms/ProductInfoForm';
import { SynthesisGeneralForm } from './forms/SynthesisGeneralForm.tsx';
import { SynthesisDetailsForm } from './forms/SynthesisDetailsForm';
import { CharacterizationForm } from './forms/CharacterizationForm';
import { MPIFData } from '@/types/mpif';
import { useMPIFStore } from '@/store/mpifStore';

interface DashboardProps {
  className?: string;
}

const sidebarSections = [
  {
    id: 'metadata',
    label: 'Metadata',
    icon: FileText,
    description: 'File information and audit details'
  },
  {
    id: 'productInfo',
    label: 'Product Information',
    icon: Package,
    description: 'Material properties and characteristics'
  },
  {
    id: 'synthesisGeneral',
    label: 'Synthesis General',
    icon: Beaker,
    description: 'Reaction conditions and parameters'
  },
  {
    id: 'synthesisDetails',
    label: 'Synthesis Details',
    icon: Settings,
    description: 'Reagents, equipment, and procedures'
  },
  {
    id: 'characterization',
    label: 'Characterization',
    icon: Database,
    description: 'Analytical data and measurements'
  }
];


export function Dashboard({ className }: DashboardProps) {
  const navigate = useNavigate();
  const {
    mpifData,
    dashboard,
    fileState,
    validation,
    setCurrentSection,
    exportMPIF,
    loadMPIFFile,
    updateSection,
    createNewMPIF,
    clearUnsavedChanges,
    setColumnLayout
  } = useMPIFStore();

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
        // You might want to show an error to the user here
        console.error(error);
      }
    } else {
      // Show an error about invalid file type
      console.error('Invalid file type. Please upload a .mpif file');
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

  const handleExport = () => {
    (document.activeElement as HTMLElement)?.blur();
    
    setTimeout(() => {
      try {
        const content = exportMPIF();
        const exportFileName = fileState.fileName || 'untitled.mpif';
        // Create download
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = exportFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        // Clear unsaved changes flag after successful export
        clearUnsavedChanges();
      } catch (error) {
        console.error('Export failed:', error);
        // Optionally, update the store with an error message
      }
    }, 100); // Give a moment for the blur to trigger the save
  };


  const renderSectionForm = () => {
    if (!mpifData) return null;

    const sectionErrors = validation.errors.filter(
      (error: any) => error.section === dashboard.currentSection
    );

    const commonProps = {
      onSave: (data: any) => updateSection(dashboard.currentSection as keyof MPIFData, data),
      onUnsavedChange: () => {}, // This is handled by the store now
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
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Form for {dashboard.currentSection} section will be implemented here.
            </p>
          </div>
        );
    }
  };

  const currentSectionData = sidebarSections.find(s => s.id === dashboard.currentSection);

      return (
      <div {...getRootProps()} className={cn('flex h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden', className)}>
        <input {...getInputProps()} />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Sidebar */}
        <div className="group relative w-16 hover:w-80 border-r bg-white/80 backdrop-blur-sm border-slate-200/50 flex flex-col transition-all duration-300 ease-in-out">
        {/* Navigation - Centered */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
          <nav className="space-y-4 w-full">
            {sidebarSections.map((section) => {
              const Icon = section.icon;
              const isActive = dashboard.currentSection === section.id;
              const hasErrors = validation.errors.some((error: any) => error.section === section.id);
              
              return (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(section.id)}
                  className={cn(
                    'w-full flex items-center px-3 py-3 rounded-lg text-left transition-all duration-300',
                    'hover:bg-accent hover:text-accent-foreground',
                    isActive && 'bg-primary text-primary-foreground',
                    hasErrors && !isActive && 'border-l-2 border-red-500',
                    'group-hover:justify-start group-hover:items-start group-hover:space-x-3 justify-center'
                  )}
                >
                  <Icon className={cn(
                    'h-5 w-5 flex-shrink-0 transition-colors group-hover:mt-0.5',
                    hasErrors && !isActive && 'text-red-500'
                  )} />
                  <div className="flex-1 min-w-0 overflow-hidden transition-opacity duration-300 group-hover:opacity-100 opacity-0">
                    <p className="text-sm font-medium whitespace-nowrap">{section.label}</p>
                    <p className={cn(
                      'text-xs whitespace-nowrap',
                      isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    )}>
                      {section.description}
                    </p>
                    {hasErrors && (
                      <p className={cn(
                        'text-xs mt-1 whitespace-nowrap',
                        isActive ? 'text-red-300' : 'text-red-500'
                      )}>
                        {validation.errors.filter((e: any) => e.section === section.id).length} incomplete fields
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
        </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
                 {/* Header */}
         <div className="border-b bg-card px-3 md:px-4 py-3">
           <div className="flex items-center justify-between">
             <div>
               <h2 className="text-xl font-semibold flex items-center space-x-2">
                 {currentSectionData && <currentSectionData.icon className="h-5 w-5" />}
                 <span>{currentSectionData?.label || 'Dashboard'}</span>
               </h2>
               <p className="text-sm text-muted-foreground">
                 {currentSectionData?.description || 'Select a section to begin editing'}
               </p>
             </div>
             
             <div className="flex items-center space-x-4">
               {/* File Status */}
               <div className="flex items-center space-x-4 text-sm">
                 {fileState.fileName ? (
                   <div className="flex items-center space-x-2">
                     <FileText className="h-4 w-4 text-blue-600" />
                     <span className="font-medium">{fileState.fileName}</span>
                   </div>
                 ) : (
                   <span className="text-slate-500">No file loaded</span>
                 )}
                 
                 {dashboard.hasUnsavedChanges && (
                   <div className="flex items-center space-x-1 text-amber-600">
                     <AlertTriangle className="h-3 w-3" />
                     <span className="text-xs">Unsaved changes</span>
                   </div>
                 )}
                 
                 {!validation.isValid && (
                   <div className="flex items-center space-x-1 text-red-600">
                     <AlertTriangle className="h-3 w-3" />
                     <span className="text-xs">{validation.errors.length} incomplete fields</span>
                   </div>
                 )}
                 
                 {fileState.lastSaved && (
                   <span className="text-xs text-slate-500">
                     Last saved: {fileState.lastSaved.toLocaleTimeString()}
                   </span>
                 )}
               </div>

               {/* Action Buttons */}
               <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setColumnLayout((dashboard as any).columnLayout === 'double' ? 'single' : 'double')}
                >
                  <Columns className="h-4 w-4 mr-2" />
                  {(dashboard as any).columnLayout === 'double' ? 'One-column' : 'Two-column'}
                </Button>
                 <Button 
                   size="sm" 
                   variant="outline" 
                   onClick={handleExport}
                   disabled={!mpifData}
                 >
                   <Download className="h-4 w-4 mr-2" />
                   Export
                 </Button>
                 <Button variant="outline" size="sm" onClick={handleGoHome}>
                   <Home className="h-4 w-4 mr-2" />
                   Home
                 </Button>
                 <Button variant="outline" size="sm" onClick={handleUploadClick}>
                   Upload File
                 </Button>
                 <Button size="sm" onClick={handleCreateNewMPIF}>
                   <Upload className="h-4 w-4 mr-2" />
                   Create MPIF
                 </Button>
               </div>
             </div>
           </div>
         </div>

        {/* Content Area */}
        <div className="relative flex-1 overflow-auto p-6 md:p-8">
          <div className="mx-6 md:mx-8">
            {renderSectionForm()}
          </div>
        </div>

        <style>{`
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </div>
    </div>
  );
}

export default Dashboard; 