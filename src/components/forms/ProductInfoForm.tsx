import { useForm, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductInfo } from '@/types/mpif';
import { useState, useEffect } from 'react';
import { CIFFileUpload } from '../ui/CIFFileUpload';
import { EditableSelect } from '../ui/EditableSelect';
import { cn } from '@/lib/utils';
import { useMPIFStore } from '@/store/mpifStore';

interface ValidationError {
  field: string;
  message: string;
  section: string;
}

interface ProductInfoFormProps {
  data?: ProductInfo;
  onSave: (data: ProductInfo) => void;
  onUnsavedChange: () => void;
  errors?: ValidationError[];
}

export function ProductInfoForm({ data, onSave, onUnsavedChange, errors = [] }: ProductInfoFormProps) {
  const { dashboard } = useMPIFStore();
  // Convert structured CIF to string for display
  const getCifString = (cif: any) => {
    if (!cif) return '';
    if (typeof cif === 'string') return cif;
    // If it's structured, keep it as-is (we'll just show "[Structured CIF Data]")
    return '[Structured CIF Data]';
  };
  const [cifContent, setCifContent] = useState(getCifString(data?.cif));
  const [cifFileName, setCifFileName] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors: formErrors, isDirty },
    getValues,
    reset,
  } = useForm<ProductInfo>({
    defaultValues: data || {
      type: '',
      commonName: '',
      state: '',
      color: '',
      handlingAtmosphere: '',
      casNumber: '',
      ccdcNumber: '',
      systematicName: '',
      formula: '',
      formulaWeight: undefined,
      handlingNote: ''
    }
  });

  // Helper function to check if a field has validation errors
  const hasValidationError = (fieldName: string) => {
    return errors.some(error => error.field === fieldName);
  };

  const onSubmit = (formData: ProductInfo) => {
    // Include CIF content if provided
    const cifStr = typeof cifContent === 'string' ? cifContent.trim() : '';
    if (cifStr && cifStr !== '[Structured CIF Data]') {
      formData.cif = cifContent;
    } else if (data?.cif && typeof data.cif !== 'string') {
      // Keep structured CIF if it exists
      formData.cif = data.cif;
    }
    onSave(formData);
  };

  // Reset form when data changes
  useEffect(() => {
    reset(data);
    setCifContent(getCifString(data?.cif));
    setCifFileName('');
  }, [data, reset]);

  // Watch for changes to trigger unsaved state and auto-save
  const hasChanges = isDirty || cifContent !== getCifString(data?.cif);
  useEffect(() => {
    if (hasChanges) {
      onUnsavedChange();
      // Auto-save after a short delay
      const timeoutId = setTimeout(() => {
        const formData = getValues();
        const cifStr = typeof cifContent === 'string' ? cifContent.trim() : '';
        if (cifStr && cifStr !== '[Structured CIF Data]') {
          formData.cif = cifContent;
        } else if (data?.cif && typeof data.cif !== 'string') {
          // Keep structured CIF if it exists
          formData.cif = data.cif;
        }
        onSave(formData);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [hasChanges, onUnsavedChange, onSave, getValues, cifContent]);

  const handleCifFileLoad = (content: string, filename: string) => {
    setCifContent(content);
    setCifFileName(filename);
    onUnsavedChange();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className={cn('grid gap-6', (dashboard as any).columnLayout === 'double' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1')}>
      <Card>
        <CardHeader>
          <CardTitle>Product Identification</CardTitle>
          <CardDescription>
            Basic identification and naming information for the synthesized material
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Material Type *</Label>
              <Controller
                name="type"
                control={control}
                rules={{ required: 'Material type is required' }}
                render={({ field }) => (
                  <EditableSelect
                    {...field}
                    options={['porous framework material', 'inorganic', 'organic', 'composite']}
                  />
                )}
              />
              {formErrors.type && (
                <p className="text-sm text-red-600">{formErrors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="commonName">Common Name *</Label>
              <Input
                id="commonName"
                {...register('commonName', { 
                  required: 'Common name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters'
                  }
                })}
                className={cn(hasValidationError('commonName') && "border-red-500 ring-red-500")}
              />
              {formErrors.commonName && (
                <p className="text-sm text-red-600">{formErrors.commonName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Physical State *</Label>
              <Controller
                name="state"
                control={control}
                rules={{ required: 'Physical state is required' }}
                render={({ field }) => (
                  <EditableSelect
                    {...field}
                    options={['solid', 'liquid', 'gas', 'suspension']}
                  />
                )}
              />
              {formErrors.state && (
                <p className="text-sm text-red-600">{formErrors.state.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color *</Label>
              <Input
                id="color"
                {...register('color', { 
                  required: 'Color is required' 
                })}
              />
              {formErrors.color && (
                <p className="text-sm text-red-600">{formErrors.color.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="handlingAtmosphere">Handling Atmosphere *</Label>
              <Controller
                name="handlingAtmosphere"
                control={control}
                rules={{ required: 'Handling atmosphere is required' }}
                render={({ field }) => (
                  <EditableSelect
                    {...field}
                    options={['air', 'inert', 'water-free', 'oxygen-free']}
                  />
                )}
              />
              {formErrors.handlingAtmosphere && (
                <p className="text-sm text-red-600">{formErrors.handlingAtmosphere.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="formula">Chemical Formula</Label>
              <Input
                id="formula"
                {...register('formula')}
              />
              <p className="text-xs text-muted-foreground">
                Use standard chemical notation
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="formulaWeight">Formula Weight (g/mol)</Label>
              <Input
                id="formulaWeight"
                type="number"
                step="0.01"
                {...register('formulaWeight', {
                  valueAsNumber: true,
                  min: {
                    value: 0,
                    message: 'Formula weight must be positive'
                  }
                })}
              />
              {formErrors.formulaWeight && (
                <p className="text-sm text-red-600">{formErrors.formulaWeight.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="casNumber">CAS Number</Label>
              <Input
                id="casNumber"
                {...register('casNumber', {
                  pattern: {
                    value: /^[0-9]{2,7}-[0-9]{2}-[0-9]$/,
                    message: 'CAS format: XXXXXX-XX-X'
                  }
                })}
              />
              {formErrors.casNumber && (
                <p className="text-sm text-red-600">{formErrors.casNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ccdcNumber">CCDC Number</Label>
              <Input
                id="ccdcNumber"
                {...register('ccdcNumber')}
              />
              <p className="text-xs text-muted-foreground">
                Cambridge Crystal Database number if available
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="systematicName">Systematic Name</Label>
              <Input
                id="systematicName"
                {...register('systematicName')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="handlingNote">Handling Notes</Label>
            <textarea
              id="handlingNote"
              {...register('handlingNote')}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground">
              Any special handling or safety considerations
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Crystal Structure Section */}
      <Card>
        <CardHeader>
          <CardTitle>Crystal Structure</CardTitle>
          <CardDescription>
            Upload crystallographic information file (CIF format)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>CIF File Upload</Label>
            <CIFFileUpload 
              onFileLoad={handleCifFileLoad}
              currentFileName={cifFileName}
            />
            <p className="text-xs text-muted-foreground">
              Upload a Crystallographic Information File (.cif) containing the crystal structure
            </p>
            {cifContent && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs font-medium mb-1">Structure Preview:</p>
                {typeof cifContent === 'string' ? (
                  <>
                    <p className="text-xs font-mono text-muted-foreground">
                      {cifContent.split('\n').slice(0, 5).join('\n')}
                      {cifContent.split('\n').length > 5 && '\n...'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {cifContent.split('\n').length} lines, {cifContent.length} characters
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Structured CIF data loaded
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>

      <div className="flex justify-end space-x-2">
        {/* <Button type="submit" disabled={!hasChanges}>
          Save Product Information
        </Button> */}
      </div>
    </form>
  );
} 