import { useForm, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductInfo } from '@/types/mpif';
import { useCallback, useState, useEffect, useRef } from 'react';
import { CIFFileUpload } from '../ui/CIFFileUpload';
import { EditableSelect } from '../ui/EditableSelect';
import { DecimalInput } from '../ui/DecimalInput';
import { cn } from '@/lib/utils';
import { useMPIFStore } from '@/store/mpifStore';
import { AlertCircle, CheckCircle } from 'lucide-react';

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
  const readOnly = (dashboard as any).readOnly;
  // Convert structured CIF to string for display
  const getCifString = (cif: any) => {
    if (!cif) return '';
    if (typeof cif === 'string') return cif;
    // If it's structured, keep it as-is (we'll just show "[Structured CIF Data]")
    return '[Structured CIF Data]';
  };
  const [cifContent, setCifContent] = useState(getCifString(data?.cif));
  const [cifFileName, setCifFileName] = useState(data?.cif ? 'Embedded CIF data' : '');
  const syncingFromPropsRef = useRef(false);

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

  const mergeCifData = useCallback((formData: ProductInfo): ProductInfo => {
    const nextData = { ...formData };

    // Include CIF content if provided
    const cifStr = typeof cifContent === 'string' ? cifContent.trim() : '';
    if (cifStr && cifStr !== '[Structured CIF Data]') {
      nextData.cif = cifContent;
    } else if (data?.cif && typeof data.cif !== 'string') {
      // Keep structured CIF if it exists
      nextData.cif = data.cif;
    } else {
      delete nextData.cif;
    }

    return nextData;
  }, [cifContent, data?.cif]);

  const onSubmit = (formData: ProductInfo) => {
    onSave(mergeCifData(formData));
  };

  // Reset form when data changes
  useEffect(() => {
    syncingFromPropsRef.current = true;
    reset(data);
    setCifContent(getCifString(data?.cif));
    setCifFileName(data?.cif ? 'Embedded CIF data' : '');

    const timeoutId = window.setTimeout(() => {
      syncingFromPropsRef.current = false;
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [data, reset]);

  // Watch for changes to trigger unsaved state and auto-save
  const hasChanges = isDirty || cifContent !== getCifString(data?.cif);
  const saveIfChanged = useCallback(() => {
    if (!hasChanges || syncingFromPropsRef.current) return;

    onUnsavedChange();
    onSave(mergeCifData(getValues()));
  }, [getValues, hasChanges, mergeCifData, onSave, onUnsavedChange]);

  useEffect(() => {
    if (hasChanges && !syncingFromPropsRef.current) {
      // Auto-save after a short delay
      const timeoutId = setTimeout(() => {
        saveIfChanged();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [hasChanges, saveIfChanged]);

  const handleCifFileLoad = (content: string, filename: string) => {
    setCifContent(content);
    setCifFileName(filename);
    onUnsavedChange();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
      onBlurCapture={(event) => {
        const related = event.relatedTarget as HTMLElement | null;
        if (!related || !event.currentTarget.contains(related)) {
          setTimeout(() => saveIfChanged(), 0);
        }
      }}
    >
      <fieldset disabled={readOnly} className="contents">
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
                    className={cn(hasValidationError('type') && "border-red-500 ring-red-500")}
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
                    className={cn(hasValidationError('state') && "border-red-500 ring-red-500")}
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
                className={cn(hasValidationError('color') && "border-red-500 ring-red-500")}
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
                    className={cn(hasValidationError('handlingAtmosphere') && "border-red-500 ring-red-500")}
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
              <Controller
                name="formulaWeight"
                control={control}
                rules={{ min: { value: 0, message: 'Formula weight must be positive' } }}
                render={({ field }) => (
                  <DecimalInput
                    id="formulaWeight"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
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
              currentFileName={cifFileName || (cifContent ? 'Embedded CIF data' : '')}
            />
            <p className="text-xs text-muted-foreground">
              Upload a Crystallographic Information File (.cif) containing the crystal structure
            </p>
            <div className={`flex items-center gap-2 text-xs font-medium ${cifContent ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400'}`}>
              {cifContent ? <CheckCircle className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
              <span>
                {cifContent
                  ? 'CIF data attached for MPIF export'
                  : 'No CIF data attached yet'}
              </span>
            </div>
            {cifContent && (
              <div className="bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 p-3 rounded-xl text-zinc-800 dark:text-zinc-200">
                <p className="text-xs font-medium mb-1">Structure Preview:</p>
                {typeof cifContent === 'string' ? (
                  <>
                    <p className="text-xs font-mono text-zinc-600 dark:text-zinc-300">
                      {cifContent.split('\n').slice(0, 5).join('\n')}
                      {cifContent.split('\n').length > 5 && '\n...'}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                      {cifContent.split('\n').length} lines, {cifContent.length} characters
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Structured CIF data loaded
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
      </fieldset>

      <div className="flex justify-end space-x-2">
        {/* <Button type="submit" disabled={!hasChanges}>
          Save Product Information
        </Button> */}
      </div>
    </form>
  );
}
