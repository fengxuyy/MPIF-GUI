import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SynthesisGeneral } from '@/types/mpif';

interface SynthesisGeneralFormProps {
  data?: SynthesisGeneral;
  onSave: (data: SynthesisGeneral) => void;
  onUnsavedChange: () => void;
}

export function SynthesisGeneralForm({ data, onSave, onUnsavedChange }: SynthesisGeneralFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<SynthesisGeneral>({
    defaultValues: data || {
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
    }
  });

  // Watch for changes to trigger unsaved state
  const watchedFields = watch();
  if (isDirty) {
    onUnsavedChange();
  }

  const onSubmit = (formData: SynthesisGeneral) => {
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
          <CardDescription>
            When and where the synthesis was performed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="performedDate">Performed Date *</Label>
              <Input
                id="performedDate"
                type="date"
                {...register('performedDate', { required: 'Date is required' })}
              />
              {errors.performedDate && (
                <p className="text-sm text-red-600">{errors.performedDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="labTemperature">Lab Temperature (°C) *</Label>
              <Input
                id="labTemperature"
                type="number"
                step="0.1"
                {...register('labTemperature', {
                  required: 'Lab temperature is required',
                  valueAsNumber: true,
                  min: { value: -50, message: 'Temperature too low' },
                  max: { value: 100, message: 'Temperature too high' }
                })}
                placeholder="25"
              />
              {errors.labTemperature && (
                <p className="text-sm text-red-600">{errors.labTemperature.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="labHumidity">Lab Humidity (%) *</Label>
              <Input
                id="labHumidity"
                type="number"
                step="1"
                {...register('labHumidity', {
                  required: 'Lab humidity is required',
                  valueAsNumber: true,
                  min: { value: 0, message: 'Humidity must be 0-100%' },
                  max: { value: 100, message: 'Humidity must be 0-100%' }
                })}
                placeholder="50"
              />
              {errors.labHumidity && (
                <p className="text-sm text-red-600">{errors.labHumidity.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reaction Conditions</CardTitle>
          <CardDescription>
            Temperature, time, atmosphere, and other reaction parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reactionType">Reaction Type *</Label>
              <select
                id="reactionType"
                {...register('reactionType', { required: 'Reaction type is required' })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="mix">Mix</option>
                <option value="diffusion">Diffusion</option>
                <option value="evaporation">Evaporation</option>
                <option value="microwave">Microwave</option>
                <option value="mechanochemical">Mechanochemical</option>
                <option value="electrochemical">Electrochemical</option>
                <option value="sonochemical">Sonochemical</option>
                <option value="photochemical">Photochemical</option>
                <option value="flow">Flow</option>
                <option value="other">Other</option>
              </select>
              {errors.reactionType && (
                <p className="text-sm text-red-600">{errors.reactionType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reactionAtmosphere">Reaction Atmosphere *</Label>
              <select
                id="reactionAtmosphere"
                {...register('reactionAtmosphere', { required: 'Atmosphere is required' })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="air">Air</option>
                <option value="inert">Inert</option>
                <option value="vacuum">Vacuum</option>
                <option value="other">Other</option>
              </select>
              {errors.reactionAtmosphere && (
                <p className="text-sm text-red-600">{errors.reactionAtmosphere.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reactionTemperature">Reaction Temperature (°C) *</Label>
              <Input
                id="reactionTemperature"
                type="number"
                step="0.1"
                {...register('reactionTemperature', {
                  required: 'Reaction temperature is required',
                  valueAsNumber: true
                })}
                placeholder="120"
              />
              {errors.reactionTemperature && (
                <p className="text-sm text-red-600">{errors.reactionTemperature.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperatureController">Temperature Controller *</Label>
              <select
                id="temperatureController"
                {...register('temperatureController', { required: 'Temperature controller is required' })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="ambient">Ambient</option>
                <option value="oven">Oven</option>
                <option value="liquid_bath">Liquid Bath</option>
                <option value="dry_bath">Dry Bath</option>
                <option value="hot_plate">Hot Plate</option>
                <option value="microwave">Microwave</option>
                <option value="furnace">Furnace</option>
                <option value="other">Other</option>
              </select>
              {errors.temperatureController && (
                <p className="text-sm text-red-600">{errors.temperatureController.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reactionTime">Reaction Time *</Label>
              <Input
                id="reactionTime"
                type="number"
                step="0.1"
                {...register('reactionTime', {
                  required: 'Reaction time is required',
                  valueAsNumber: true,
                  min: { value: 0, message: 'Time must be positive' }
                })}
                placeholder="24"
              />
              {errors.reactionTime && (
                <p className="text-sm text-red-600">{errors.reactionTime.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reactionTimeUnit">Time Unit *</Label>
              <select
                id="reactionTimeUnit"
                {...register('reactionTimeUnit', { required: 'Time unit is required' })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="s">Seconds</option>
                <option value="min">Minutes</option>
                <option value="h">Hours</option>
                <option value="days">Days</option>
              </select>
              {errors.reactionTimeUnit && (
                <p className="text-sm text-red-600">{errors.reactionTimeUnit.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reactionContainer">Reaction Container *</Label>
            <Input
              id="reactionContainer"
              {...register('reactionContainer', { required: 'Container description is required' })}
              placeholder="20 mL glass vial, stainless steel autoclave, etc."
            />
            {errors.reactionContainer && (
              <p className="text-sm text-red-600">{errors.reactionContainer.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>
            Amount, yield, and scale of the synthesized product
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productAmount">Product Amount *</Label>
              <Input
                id="productAmount"
                type="number"
                step="0.001"
                {...register('productAmount', {
                  required: 'Product amount is required',
                  valueAsNumber: true,
                  min: { value: 0, message: 'Amount must be positive' }
                })}
                placeholder="125.5"
              />
              {errors.productAmount && (
                <p className="text-sm text-red-600">{errors.productAmount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="productAmountUnit">Amount Unit *</Label>
              <select
                id="productAmountUnit"
                {...register('productAmountUnit', { required: 'Unit is required' })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="mg">mg</option>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="μL">μL</option>
                <option value="mL">mL</option>
                <option value="L">L</option>
              </select>
              {errors.productAmountUnit && (
                <p className="text-sm text-red-600">{errors.productAmountUnit.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="scale">Synthesis Scale *</Label>
              <select
                id="scale"
                {...register('scale', { required: 'Scale is required' })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="milligram">Milligram</option>
                <option value="gram">Gram</option>
                <option value="multigram">Multigram</option>
                <option value="kilogram">Kilogram</option>
              </select>
              {errors.scale && (
                <p className="text-sm text-red-600">{errors.scale.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="productYield">Yield (%)</Label>
              <Input
                id="productYield"
                type="number"
                step="0.1"
                min="0"
                max="100"
                {...register('productYield', {
                  valueAsNumber: true,
                  min: { value: 0, message: 'Yield must be positive' },
                  max: { value: 100, message: 'Yield cannot exceed 100%' }
                })}
                placeholder="75.3"
              />
              {errors.productYield && (
                <p className="text-sm text-red-600">{errors.productYield.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reactionNote">Reaction Notes</Label>
            <textarea
              id="reactionNote"
              {...register('reactionNote')}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Additional observations, modifications, or notes about the synthesis..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="safetyNote">Safety Notes</Label>
            <textarea
              id="safetyNote"
              {...register('safetyNote')}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Safety precautions, hazards, protective equipment used..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={!isDirty}>
          Save Synthesis Conditions
        </Button>
      </div>
    </form>
  );
} 