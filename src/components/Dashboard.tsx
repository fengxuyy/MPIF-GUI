import { useState, useEffect } from 'react';
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
import { AuthorDetailsForm } from './forms/AuthorDetailsForm';
import { ProductInfoForm } from './forms/ProductInfoForm';
import { SynthesisGeneralForm } from './forms/SynthesisGeneralForm';
import { SynthesisDetailsForm } from './forms/SynthesisDetailsForm';
import { CharacterizationForm } from './forms/CharacterizationForm';
import { MPIFData } from '@/types/mpif';
import { parseMPIF, stringifyMPIF } from '@/utils/mpifParser';

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
    id: 'authorDetails',
    label: 'Author Details',
    icon: User,
    description: 'Contact author information'
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
  // Real state management instead of mocks
  const [currentSection, setCurrentSection] = useState('metadata');
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [fileName, setFileName] = useState<string | undefined>(undefined);
  const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [mpifData, setMpifData] = useState<MPIFData | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('mpif-dark-mode');
    if (savedDarkMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Computed values
  const dashboard = {
    currentSection,
    isEditing,
    hasUnsavedChanges,
    darkMode
  };

  const fileState = {
    fileName,
    lastSaved,
    isLoading,
    error
  };

  const validation = {
    isValid: validationErrors.length === 0,
    errors: validationErrors
  };

  // Actions
  const handleSetCurrentSection = (section: string) => {
    console.log('Switching to section:', section);
    setCurrentSection(section);
  };

  const handleToggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Apply to document
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('mpif-dark-mode', newDarkMode.toString());
    console.log('Dark mode toggled:', newDarkMode);
  };

  const handleExport = () => {
    try {
      if (!mpifData) {
        console.log('No data to export');
        return;
      }
      
      const content = stringifyMPIF(mpifData);
      const exportFileName = fileName || 'untitled.mpif';
      
      downloadFile(content, exportFileName, 'text/plain');
      console.log('File exported:', exportFileName);
    } catch (error) {
      console.error('Export failed:', error);
      setError('Export failed');
    }
  };

  const handleResetData = () => {
    console.log('Resetting all data...');
    setMpifData(null);
    setFileName(undefined);
    setLastSaved(undefined);
    setError(undefined);
    setValidationErrors([]);
    setHasUnsavedChanges(false);
    setIsEditing(false);
    setCurrentSection('metadata');
  };

  const handleCreateNewMPIF = () => {
    console.log('Creating new MPIF...');
    // This would create a default MPIF structure
    const newMPIF: MPIFData = {
      metadata: {
        dataName: 'New_MPIF',
        creationDate: new Date().toISOString().split('T')[0],
        generatorVersion: '1.0.0',
        procedureStatus: 'test'
      },
      authorDetails: {
        name: '',
        email: '',
        orcid: ''
      },
      productInfo: {
        type: 'porous framework material',
        commonName: '',
        state: 'solid',
        color: '',
        handlingAtmosphere: 'air'
      },
      synthesisGeneral: {
        performedDate: new Date().toISOString().split('T')[0],
        labTemperature: 25,
        labHumidity: 50,
        reactionType: 'mix',
        reactionTemperature: 25,
        temperatureController: 'ambient',
        reactionTime: 24,
        reactionTimeUnit: 'h',
        reactionAtmosphere: 'air',
        reactionContainer: '',
        productAmount: 0,
        productAmountUnit: 'mg',
        scale: 'milligram'
      },
      synthesisDetails: {
        substrates: [],
        solvents: [],
        vessels: [],
        hardware: [],
        steps: []
      },
      characterization: {}
    };
    setMpifData(newMPIF);
    setFileName('New_MPIF.mpif');
    setIsEditing(true);
    setHasUnsavedChanges(true);
  };

  const handleFileLoad = (content: string, filename: string) => {
    console.log('Loading file:', filename);
    setIsLoading(true);
    setError(undefined);
    
    try {
      // Parse the actual MPIF content
      const parsedData = parseMPIF(content);
      console.log('Parsed MPIF data:', parsedData);
      
      setMpifData(parsedData);
      setFileName(filename);
      setLastSaved(new Date());
      setIsEditing(true);
      setHasUnsavedChanges(false);
      setCurrentSection('metadata');
      
      // Clear validation errors since we have real data
      setValidationErrors([]);
      
    } catch (err) {
      console.error('Failed to parse MPIF file:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse MPIF file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSection = (sectionData: any) => {
    if (!mpifData) return;
    
    const updatedData = { ...mpifData };
    
    // Update the specific section
    switch (currentSection) {
      case 'metadata':
        updatedData.metadata = sectionData;
        break;
      case 'authorDetails':
        updatedData.authorDetails = sectionData;
        break;
      case 'productInfo':
        updatedData.productInfo = sectionData;
        break;
      case 'synthesisGeneral':
        updatedData.synthesisGeneral = sectionData;
        break;
      case 'synthesisDetails':
        updatedData.synthesisDetails = sectionData;
        break;
      case 'characterization':
        updatedData.characterization = sectionData;
        break;
    }
    
    setMpifData(updatedData);
    setHasUnsavedChanges(false);
    setLastSaved(new Date());
    console.log(`${currentSection} data saved:`, sectionData);
  };

  const renderSectionForm = () => {
    if (!mpifData) return null;

    const commonProps = {
      onSave: handleSaveSection,
      onUnsavedChange: () => setHasUnsavedChanges(true)
    };

    switch (currentSection) {
      case 'metadata':
        return <MetadataForm data={mpifData.metadata} {...commonProps} />;
      case 'authorDetails':
        return <AuthorDetailsForm data={mpifData.authorDetails} {...commonProps} />;
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
              Form for {currentSection} section will be implemented here.
            </p>
          </div>
        );
    }
  };

  const currentSectionData = sidebarSections.find(s => s.id === currentSection);

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
              onClick={handleToggleDarkMode}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Material Preparation Information File Editor
          </p>
        </div>

        {/* File Status */}
        <div className="p-4 border-b">
          <div className="space-y-2">
            {fileName ? (
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium truncate">{fileName}</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No file loaded</p>
            )}
            
            {hasUnsavedChanges && (
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
            
            {lastSaved && (
              <p className="text-xs text-muted-foreground">
                Last saved: {lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 mt-3">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              disabled={!hasUnsavedChanges}
              onClick={() => {
                setHasUnsavedChanges(false);
                setLastSaved(new Date());
                console.log('Data saved');
              }}
            >
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
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
              const isActive = currentSection === section.id;
              const hasErrors = validation.errors.some((error: ValidationError) => error.section === section.id);
              
              return (
                <button
                  key={section.id}
                  onClick={() => handleSetCurrentSection(section.id)}
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
              <Button variant="outline" size="sm" onClick={handleResetData}>
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
                  <FileUpload onFileLoad={handleFileLoad} />
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