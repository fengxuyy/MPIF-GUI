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
  createNewMPIF: () => void;
  updateSection: (section: keyof MPIFData, data: any) => void;
  
  // UI actions
  setCurrentSection: (section: string) => void;
  setColumnLayout: (mode: 'single' | 'double') => void;
  
  // File actions
  exportMPIF: () => string;
  resetData: () => void;
  clearUnsavedChanges: () => void;
  
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
    generatorVersion: '1.1',
    publicationDOI: '',
    procedureStatus: 'test',
    name: '',
    email: '',
    orcid: '',
    address: '',
    phone: ''
  },
  productInfo: {
    type: 'other',
    casNumber: '',
    ccdcNumber: '',
    commonName: '',
    systematicName: '',
    formula: '',
    formulaWeight: 0,
    state: 'other',
    color: '',
    handlingAtmosphere: 'other',
    handlingNote: ''
  },
  synthesisGeneral: {
    performedDate: '',
    labTemperature: 0,
    labHumidity: 0,
    reactionType: 'other',
    reactionTemperature: 0,
    temperatureController: 'other',
    reactionTime: 0,
    reactionTimeUnit: 'h',
    reactionAtmosphere: 'other',
    reactionContainer: '',
    reactionNote: '',
    productAmount: 0,
    productAmountUnit: 'g',
    productYield: 0,
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
  // Product amount is optional - no validation needed

  // Validate synthesis details - substrates
  if (data.synthesisDetails && data.synthesisDetails.substrates) {
    data.synthesisDetails.substrates.forEach((substrate, index) => {
      if (!substrate.name || substrate.name.trim() === '') {
        errors.push({ 
          field: `substrates[${index}].name`, 
          message: 'Substrate name is required', 
          section: 'synthesisDetails' 
        });
      }
      if (substrate.amount === undefined || substrate.amount <= 0) {
        errors.push({ 
          field: `substrates[${index}].amount`, 
          message: 'Substrate amount is required and must be positive', 
          section: 'synthesisDetails' 
        });
      }
      if (!substrate.amountUnit || substrate.amountUnit.trim() === '') {
        errors.push({ 
          field: `substrates[${index}].amountUnit`, 
          message: 'Substrate amount unit is required', 
          section: 'synthesisDetails' 
        });
      }
    });
  }

  // Validate synthesis details - solvents
  if (data.synthesisDetails && data.synthesisDetails.solvents) {
    data.synthesisDetails.solvents.forEach((solvent, index) => {
      if (!solvent.name || solvent.name.trim() === '') {
        errors.push({ 
          field: `solvents[${index}].name`, 
          message: 'Solvent name is required', 
          section: 'synthesisDetails' 
        });
      }
      if (solvent.amount === undefined || solvent.amount <= 0) {
        errors.push({ 
          field: `solvents[${index}].amount`, 
          message: 'Solvent amount is required and must be positive', 
          section: 'synthesisDetails' 
        });
      }
      if (!solvent.amountUnit || solvent.amountUnit.trim() === '') {
        errors.push({ 
          field: `solvents[${index}].amountUnit`, 
          message: 'Solvent amount unit is required', 
          section: 'synthesisDetails' 
        });
      }
    });
  }

  // Validate synthesis details - vessels
  if (data.synthesisDetails && data.synthesisDetails.vessels) {
    data.synthesisDetails.vessels.forEach((vessel, index) => {
      if (!vessel.material || vessel.material.trim() === '') {
        errors.push({ 
          field: `vessels[${index}].material`, 
          message: 'Vessel material is required', 
          section: 'synthesisDetails' 
        });
      }
      if (!vessel.type || vessel.type.trim() === '') {
        errors.push({ 
          field: `vessels[${index}].type`, 
          message: 'Vessel type is required', 
          section: 'synthesisDetails' 
        });
      }
    });
  }

  // Validate synthesis details - hardware
  if (data.synthesisDetails && data.synthesisDetails.hardware) {
    data.synthesisDetails.hardware.forEach((hardware, index) => {
      if (!hardware.generalName || hardware.generalName.trim() === '') {
        errors.push({ 
          field: `hardware[${index}].generalName`, 
          message: 'Hardware name is required', 
          section: 'synthesisDetails' 
        });
      }
    });
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
      columnLayout: 'single',
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
        
        set({
          mpifData: data,
          fileState: {
            fileName,
            lastSaved: new Date(),
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

    createNewMPIF: () => {
      const newMPIFData = createDefaultMPIFData();
      set({
        mpifData: newMPIFData,
        fileState: {
          fileName: 'untitled.mpif',
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
          hasUnsavedChanges: true,
          isEditing: true,
          currentSection: 'metadata'
        }
      });
    },


    updateSection: (section: keyof MPIFData, data: any) => {
      const currentData = get().mpifData || createDefaultMPIFData();
      const updatedData = {
        ...currentData,
        [section]: { ...currentData[section], ...data }
      };
      
      set({
        mpifData: updatedData,
        dashboard: { ...get().dashboard, hasUnsavedChanges: true }
      });
    },

    setCurrentSection: (section: string) => {
      set({
        dashboard: { ...get().dashboard, currentSection: section }
      });
    },


    setColumnLayout: (mode: 'single' | 'double') => {
      set({
        dashboard: { ...get().dashboard, columnLayout: mode }
      });
    },


    exportMPIF: () => {
      const data = get().mpifData;
      if (!data) throw new Error('No data to export');
      
      // Create a copy of the data and ensure generatorVersion is set to 1.0
      const exportData = {
        ...data,
        metadata: {
          ...data.metadata,
          generatorVersion: '1.0'
        }
      };
      
      // Validate before export
      const validation = validateMPIFData(exportData);
      set({ validation });
      
      if (!validation.isValid) {
        throw new Error(`Cannot export: ${validation.errors.length} validation errors found. Please fix the incomplete fields first.`);
      }
      
      return stringifyMPIF(exportData);
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

    clearUnsavedChanges: () => {
      set({
        dashboard: {
          ...get().dashboard,
          hasUnsavedChanges: false
        },
        fileState: {
          ...get().fileState,
          lastSaved: new Date()
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
          
          set({
            mpifData: data,
            validation: {
              isValid: true,
              errors: []
            },
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
