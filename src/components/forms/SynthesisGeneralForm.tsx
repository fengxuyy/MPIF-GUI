import { useForm, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SynthesisGeneral } from '@/types/mpif';
import { useEffect } from 'react';
import { EditableSelect } from '../ui/EditableSelect';
import { cn } from '@/lib/utils';
import { useMPIFStore } from '@/store/mpifStore';

interface ValidationError {
  field: string;
  message: string;
  section: string;
}

interface SynthesisGeneralFormProps {
  data: SynthesisGeneral;
  onSave: (data: SynthesisGeneral) => void;
  onUnsavedChange: () => void;
  errors?: ValidationError[];
}

export function SynthesisGeneralForm({ data, onSave, onUnsavedChange, errors = [] }: SynthesisGeneralFormProps) {
  const { dashboard } = useMPIFStore();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors: formErrors, isDirty },
    getValues,
    reset,
  } = useForm<SynthesisGeneral>({
    defaultValues: data || {
      performedDate: '',
      labTemperature: undefined,
      labHumidity: undefined,
      reactionType: '',
      reactionTemperature: undefined,
      temperatureController: '',
      reactionTime: undefined,
      reactionTimeUnit: '',
      reactionAtmosphere: '',
      reactionContainer: '',
      reactionNote: '',
      productAmount: undefined,
      productAmountUnit: '',
      productYield: undefined,
      scale: '',
      safetyNote: ''
    }
  });

  // Helper function to check if a field has validation errors
  const hasValidationError = (fieldName: string) => {
    return errors.some(error => error.field === fieldName);
  };

  const onSubmit = (formData: SynthesisGeneral) => {
    onSave(formData);
  };

  // Reset form when data changes
  useEffect(() => {
    reset(data);
  }, [data, reset]);

  // Watch for changes to trigger unsaved state and auto-save
  useEffect(() => {
    if (isDirty) {
      onUnsavedChange();
      // Auto-save after a short delay
      const timeoutId = setTimeout(() => {
        onSave(getValues());
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isDirty, onUnsavedChange, onSave, getValues]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className={cn('grid gap-6', (dashboard as any).columnLayout === 'double' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1')}>
      <Card>
        <CardHeader>
          <CardTitle>Laboratory Conditions</CardTitle>
          <CardDescription>
            Environmental conditions during synthesis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="labTemperature">Lab Temperature (°C)</Label>
              <Input
                id="labTemperature"
                type="number"
                step="0.1"
                {...register('labTemperature', {
                  valueAsNumber: true,
                  min: { value: -273.15, message: 'Temperature must be above absolute zero' }
                })}
                className={cn(hasValidationError('labTemperature') && "border-red-500 ring-red-500")}
              />
              {formErrors.labTemperature && (
                <p className="text-sm text-red-600">{formErrors.labTemperature.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="labHumidity">Lab Humidity (%)</Label>
              <Input
                id="labHumidity"
                type="number"
                step="1"
                {...register('labHumidity', {
                  valueAsNumber: true,
                  min: { value: 0, message: 'Humidity must be between 0 and 100%' },
                  max: { value: 100, message: 'Humidity must be between 0 and 100%' }
                })}
                className={cn(hasValidationError('labHumidity') && "border-red-500 ring-red-500")}
              />
              {formErrors.labHumidity && (
                <p className="text-sm text-red-600">{formErrors.labHumidity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="performedDate">Performed Date</Label>
              <Input
                id="performedDate"
                type="date"
                {...register('performedDate')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reaction Conditions</CardTitle>
          <CardDescription>
            Synthesis reaction parameters and conditions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reactionType">Reaction Type</Label>
              <Controller
                name="reactionType"
                control={control}
                render={({ field }) => (
                  <EditableSelect
                    {...field}
                    options={['mix', 'diffusion', 'evaporation', 'microwave', 'mechanochemical', 'electrochemical', 'sonochemical', 'photochemical', 'flow', 'other']}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reactionTemperature">Reaction Temperature (°C)</Label>
              <Input
                id="reactionTemperature"
                type="number"
                step="0.1"
                {...register('reactionTemperature', {
                  valueAsNumber: true
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperatureController">Temperature Controller</Label>
              <Controller
                name="temperatureController"
                control={control}
                render={({ field }) => (
                  <EditableSelect
                    {...field}
                    options={['ambient', 'oven', 'oil_bath', 'water_bath', 'dry_bath', 'hot_plate', 'microwave', 'furnace', 'other', 'liquid_bath']}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reactionAtmosphere">Reaction Atmosphere</Label>
              <Controller
                name="reactionAtmosphere"
                control={control}
                render={({ field }) => (
                  <EditableSelect
                    {...field}
                    options={['air', 'dry', 'inert', 'vacuum', 'other']}
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reactionTime">Reaction Time</Label>
              <Input
                id="reactionTime"
                type="number"
                step="0.1"
                {...register('reactionTime', {
                  valueAsNumber: true,
                  min: { value: 0.01, message: 'Reaction time must be positive' }
                })}
                className={cn(hasValidationError('reactionTime') && "border-red-500 ring-red-500")}
              />
              {formErrors.reactionTime && (
                <p className="text-sm text-red-600">{formErrors.reactionTime.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reactionTimeUnit">Time Unit</Label>
              <Controller
                name="reactionTimeUnit"
                control={control}
                render={({ field }) => (
                  <EditableSelect
                    {...field}
                    options={['s', 'min', 'h', 'days']}
                  />
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reactionContainer">Reaction Container</Label>
            <Input
              id="reactionContainer"
              {...register('reactionContainer')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reactionNote">Reaction Notes</Label>
            <textarea
              id="reactionNote"
              {...register('reactionNote')}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>
            Yield and scale information for the synthesized product
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productAmount">Product Amount</Label>
              <Input
                id="productAmount"
                type="number"
                step="0.001"
                {...register('productAmount', {
                  valueAsNumber: true,
                  min: { value: 0.001, message: 'Product amount must be positive' }
                })}
                className={cn(hasValidationError('productAmount') && "border-red-500 ring-red-500")}
              />
              {formErrors.productAmount && (
                <p className="text-sm text-red-600">{formErrors.productAmount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="productAmountUnit">Amount Unit</Label>
              <Controller
                name="productAmountUnit"
                control={control}
                render={({ field }) => (
                  <EditableSelect
                    {...field}
                    options={['mg', 'g', 'kg', 'μL', 'mL', 'L']}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productYield">Product Yield (%)</Label>
              <Input
                id="productYield"
                type="number"
                step="0.1"
                {...register('productYield', {
                  valueAsNumber: true,
                  min: { value: 0, message: 'Yield must be positive' },
                  max: { value: 100, message: 'Yield cannot exceed 100%' }
                })}
              />
              {formErrors.productYield && (
                <p className="text-sm text-red-600">{formErrors.productYield.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scale">Synthesis Scale</Label>
              <Controller
                name="scale"
                control={control}
                render={({ field }) => (
                  <EditableSelect
                    {...field}
                    options={['milligram', 'gram', 'multigram', 'kilogram']}
                  />
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="safetyNote">Safety Notes</Label>
            <textarea
              id="safetyNote"
              {...register('safetyNote')}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </CardContent>
      </Card>
      </div>
    </form>
  );
}
