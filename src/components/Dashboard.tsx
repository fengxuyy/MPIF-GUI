import { useEffect } from 'react';
import { 
  FileText, 
  User, 
  Package, 
  Beaker,
  Settings, 
  BarChart3,
  Moon,
  Sun,
  Download,
  Upload,
  Save,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { downloadFile } from '@/lib/utils';
import FileUpload from './FileUpload';
import { MetadataForm } from './forms/MetadataForm';
import { ProductInfoForm } from './forms/ProductInfoForm';
import { SynthesisGeneralForm } from './forms/SynthesisGeneralForm';
import { SynthesisDetailsForm } from './forms/SynthesisDetailsForm';
import { CharacterizationForm } from './forms/CharacterizationForm';
import { MPIFData } from '@/types/mpif';
import { parseMPIF, stringifyMPIF } from '@/utils/mpifParser';
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
    icon: BarChart3,
    description: 'Analytical data and measurements'
  }
];

interface ValidationError {
  field: string;
  message: string;
  section: string;
}

export function Dashboard({ className }: DashboardProps) {
  const {
    mpifData,
    dashboard,
    fileState,
    validation,
    setCurrentSection,
    toggleDarkMode,
    exportMPIF,
    resetData,
    updateMPIFData,
    loadMPIFFile,
    updateSection
  } = useMPIFStore();

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
    updateMPIFData({});
  };

  const handleExport = () => {
    (document.activeElement as HTMLElement)?.blur();
    
    setTimeout(() => {
      try {
        const content = exportMPIF();
        const exportFileName = fileState.fileName || 'untitled.mpif';
        downloadFile(content, exportFileName, 'text/plain');
      } catch (error) {
        console.error('Export failed:', error);
        // Optionally, update the store with an error message
      }
    }, 100); // Give a moment for the blur to trigger the save
  };

  const handleResetData = () => {
    console.log('Resetting all data...');
    resetData();
  };

  const renderSectionForm = () => {
    if (!mpifData) return null;

    const commonProps = {
      onSave: (data: any) => updateSection(dashboard.currentSection as keyof MPIFData, data),
      onUnsavedChange: () => {} // This is handled by the store now
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
    <div className={cn('flex h-screen bg-background', className)}>
      {/* Sidebar */}
      <div className="w-80 border-r bg-card">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">MPIF Dashboard</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
            >
              {dashboard.darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Material Preparation Information File Editor
          </p>
        </div>

        {/* File Status */}
        <div className="p-4 border-b">
          <div className="space-y-2">
            {fileState.fileName ? (
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium truncate">{fileState.fileName}</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No file loaded</p>
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
                <span className="text-xs">{validation.errors.length} validation errors</span>
              </div>
            )}
            
            {fileState.lastSaved && (
              <p className="text-xs text-muted-foreground">
                Last saved: {fileState.lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 mt-3">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleExport}
              disabled={!mpifData}
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4">
          <nav className="space-y-1">
            {sidebarSections.map((section) => {
              const Icon = section.icon;
              const isActive = dashboard.currentSection === section.id;
              const hasErrors = validation.errors.some((error: ValidationError) => error.section === section.id);
              
              return (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(section.id)}
                  className={cn(
                    'w-full flex items-start space-x-3 px-3 py-2 rounded-lg text-left transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    isActive && 'bg-primary text-primary-foreground',
                    hasErrors && !isActive && 'border-l-2 border-red-500'
                  )}
                >
                  <Icon className={cn(
                    'h-4 w-4 mt-0.5 flex-shrink-0',
                    hasErrors && !isActive && 'text-red-500'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{section.label}</p>
                    <p className={cn(
                      'text-xs',
                      isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    )}>
                      {section.description}
                    </p>
                    {hasErrors && (
                      <p className="text-xs text-red-500 mt-1">
                        {validation.errors.filter((e: ValidationError) => e.section === section.id).length} errors
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
        <div className="border-b bg-card px-6 py-4">
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
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={resetData}>
                Upload File
              </Button>
              <Button size="sm" onClick={handleCreateNewMPIF}>
                <Upload className="h-4 w-4 mr-2" />
                Create MPIF
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {!mpifData ? (
            // Welcome/Upload State
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle>Welcome to MPIF Dashboard</CardTitle>
                  <CardDescription>
                    Upload an existing MPIF file to edit or start creating a new one
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload onFileLoad={loadMPIFFile} />
                </CardContent>
              </Card>
            </div>
          ) : (
            // Editor Content
            <div className="max-w-4xl mx-auto">
              {renderSectionForm()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 