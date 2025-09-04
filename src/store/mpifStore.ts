import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { MPIFData, DashboardState, FileState, ValidationResult } from '@/types/mpif';
import { parseMPIF, stringifyMPIF } from '@/utils/mpifParser';

interface MPIFStore {
  // Data state
  mpifData: MPIFData | null;
  
  // UI state
  dashboard: DashboardState;
  fileState: FileState;
  validation: ValidationResult;
  
  // Actions
  loadMPIFFile: (content: string, fileName: string) => Promise<void>;
  updateMPIFData: (data: Partial<MPIFData>) => void;
  updateSection: (section: keyof MPIFData, data: any) => void;
  
  // UI actions
  setCurrentSection: (section: string) => void;
  setEditing: (isEditing: boolean) => void;
  toggleDarkMode: () => void;
  
  // File actions
  exportMPIF: () => string;
  resetData: () => void;
  
  // Validation
  validateData: () => ValidationResult;
  
  // Auto-save
  enableAutoSave: () => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
}

const createDefaultMPIFData = (): MPIFData => ({
  metadata: {
    dataName: '',
    creationDate: new Date().toISOString().split('T')[0],
    generatorVersion: '1.0.0',
    publicationDOI: '',
    procedureStatus: 'test',
    name: '',
    email: '',
    orcid: '',
    address: '',
    phone: ''
  },
  productInfo: {
    type: 'porous framework material',
    casNumber: '',
    ccdcNumber: '',
    commonName: '',
    systematicName: '',
    formula: '',
    formulaWeight: undefined,
    state: 'solid',
    color: '#000000',
    handlingAtmosphere: 'air',
    handlingNote: ''
  },
  synthesisGeneral: {
    performedDate: new Date().toISOString().split('T')[0],
    labTemperature: 25,
    labHumidity: 50,
    reactionType: 'mix',
    reactionTemperature: 25,
    temperatureController: 'ambient',
    reactionTime: 1,
    reactionTimeUnit: 'h',
    reactionAtmosphere: 'air',
    reactionContainer: '',
    reactionNote: '',
    productAmount: 0,
    productAmountUnit: 'mg',
    productYield: undefined,
    scale: 'milligram',
    safetyNote: ''
  },
  synthesisDetails: {
    substrates: [],
    solvents: [],
    vessels: [],
    hardware: [],
    steps: [],
    procedureFull: ''
  },
  characterization: {}
});

const validateMPIFData = (data: MPIFData): ValidationResult => {
  const errors: Array<{ field: string; message: string; section: string }> = [];

  // Validate metadata
  if (!data.metadata.dataName) {
    errors.push({ field: 'dataName', message: 'Data name is required', section: 'metadata' });
  }
  if (!data.metadata.creationDate) {
    errors.push({ field: 'creationDate', message: 'Creation date is required', section: 'metadata' });
  }

  // Validate author details in metadata
  if (!data.metadata.name) {
    errors.push({ field: 'name', message: 'Author name is required', section: 'metadata' });
  }
  if (!data.metadata.email) {
    errors.push({ field: 'email', message: 'Author email is required', section: 'metadata' });
  }
  if (!data.metadata.orcid) {
    errors.push({ field: 'orcid', message: 'ORCID is required', section: 'metadata' });
  }

  // Validate product info
  if (!data.productInfo.commonName) {
    errors.push({ field: 'commonName', message: 'Common name is required', section: 'productInfo' });
  }

  // Validate synthesis general
  if (data.synthesisGeneral.labTemperature <= -273.15) {
    errors.push({ field: 'labTemperature', message: 'Temperature must be above absolute zero', section: 'synthesisGeneral' });
  }
  if (data.synthesisGeneral.labHumidity < 0 || data.synthesisGeneral.labHumidity > 100) {
    errors.push({ field: 'labHumidity', message: 'Humidity must be between 0 and 100%', section: 'synthesisGeneral' });
  }
  if (data.synthesisGeneral.reactionTime <= 0) {
    errors.push({ field: 'reactionTime', message: 'Reaction time must be positive', section: 'synthesisGeneral' });
  }
  if (data.synthesisGeneral.productAmount <= 0) {
    errors.push({ field: 'productAmount', message: 'Product amount must be positive', section: 'synthesisGeneral' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const useMPIFStore = create<MPIFStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    mpifData: null,
    dashboard: {
      currentSection: 'metadata',
      isEditing: false,
      hasUnsavedChanges: false,
      darkMode: false
    },
    fileState: {
      fileName: undefined,
      lastSaved: undefined,
      isLoading: false,
      error: undefined
    },
    validation: {
      isValid: true,
      errors: []
    },

    // Actions
    loadMPIFFile: async (content: string, fileName: string) => {
      set({ fileState: { ...get().fileState, isLoading: true, error: undefined } });
      
      try {
        const data = parseMPIF(content);
        const validation = validateMPIFData(data);
        
        set({
          mpifData: data,
          fileState: {
            fileName,
            lastSaved: new Date(),
            isLoading: false,
            error: undefined
          },
          validation,
          dashboard: {
            ...get().dashboard,
            hasUnsavedChanges: false,
            isEditing: true
          }
        });
      } catch (error) {
        set({
          fileState: {
            ...get().fileState,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to parse MPIF file'
          }
        });
      }
    },

    updateMPIFData: (data: Partial<MPIFData>) => {
      const currentData = get().mpifData;
      if (!currentData) {
        const newData = { ...createDefaultMPIFData(), ...data };
        const validation = validateMPIFData(newData);
        set({
          mpifData: newData,
          validation,
          dashboard: { ...get().dashboard, hasUnsavedChanges: true }
        });
      } else {
        const updatedData = { ...currentData, ...data };
        const validation = validateMPIFData(updatedData);
        set({
          mpifData: updatedData,
          validation,
          dashboard: { ...get().dashboard, hasUnsavedChanges: true }
        });
      }
    },

    updateSection: (section: keyof MPIFData, data: any) => {
      const currentData = get().mpifData || createDefaultMPIFData();
      const updatedData = {
        ...currentData,
        [section]: { ...currentData[section], ...data }
      };
      const validation = validateMPIFData(updatedData);
      
      set({
        mpifData: updatedData,
        validation,
        dashboard: { ...get().dashboard, hasUnsavedChanges: true }
      });
    },

    setCurrentSection: (section: string) => {
      set({
        dashboard: { ...get().dashboard, currentSection: section }
      });
    },

    setEditing: (isEditing: boolean) => {
      set({
        dashboard: { ...get().dashboard, isEditing }
      });
    },

    toggleDarkMode: () => {
      const newDarkMode = !get().dashboard.darkMode;
      set({
        dashboard: { ...get().dashboard, darkMode: newDarkMode }
      });
      
      // Apply to document
      if (newDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Save to localStorage
      localStorage.setItem('mpif-dark-mode', newDarkMode.toString());
    },

    exportMPIF: () => {
      const data = get().mpifData;
      if (!data) throw new Error('No data to export');
      
      return stringifyMPIF(data);
    },

    resetData: () => {
      set({
        mpifData: null,
        fileState: {
          fileName: undefined,
          lastSaved: undefined,
          isLoading: false,
          error: undefined
        },
        validation: {
          isValid: true,
          errors: []
        },
        dashboard: {
          ...get().dashboard,
          hasUnsavedChanges: false,
          isEditing: false
        }
      });
    },

    validateData: () => {
      const data = get().mpifData;
      if (!data) {
        return { isValid: false, errors: [{ field: 'data', message: 'No data to validate', section: 'general' }] };
      }
      
      const validation = validateMPIFData(data);
      set({ validation });
      return validation;
    },

    enableAutoSave: () => {
      // Set up auto-save interval (every 30 seconds)
      setInterval(() => {
        if (get().dashboard.hasUnsavedChanges) {
          get().saveToLocalStorage();
        }
      }, 30000);
    },

    saveToLocalStorage: () => {
      const data = get().mpifData;
      if (data) {
        localStorage.setItem('mpif-autosave', JSON.stringify(data));
        localStorage.setItem('mpif-autosave-timestamp', new Date().toISOString());
      }
    },

    loadFromLocalStorage: () => {
      try {
        const savedData = localStorage.getItem('mpif-autosave');
        const timestamp = localStorage.getItem('mpif-autosave-timestamp');
        
        if (savedData && timestamp) {
          const data = JSON.parse(savedData) as MPIFData;
          const validation = validateMPIFData(data);
          
          set({
            mpifData: data,
            validation,
            fileState: {
              fileName: 'Autosaved Data',
              lastSaved: new Date(timestamp),
              isLoading: false,
              error: undefined
            }
          });
          
          return true;
        }
      } catch (error) {
        console.error('Failed to load from localStorage:', error);
      }
      
      return false;
    }
  }))
);

// Initialize dark mode from localStorage
const savedDarkMode = localStorage.getItem('mpif-dark-mode');
if (savedDarkMode === 'true') {
  document.documentElement.classList.add('dark');
  useMPIFStore.getState().toggleDarkMode();
} 