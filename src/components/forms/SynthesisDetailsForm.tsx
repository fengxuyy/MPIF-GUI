import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SynthesisDetails, Substrate, Solvent, Vessel, Hardware, ProcedureStep } from '@/types/mpif';
import { Plus, Trash2 } from 'lucide-react';

interface SynthesisDetailsFormProps {
  data?: SynthesisDetails;
  onSave: (data: SynthesisDetails) => void;
  onUnsavedChange: () => void;
}

export function SynthesisDetailsForm({ data, onSave, onUnsavedChange }: SynthesisDetailsFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isDirty },
  } = useForm<SynthesisDetails>({
    defaultValues: data || {
      substrates: [{ id: '1', name: '', amount: 0, amountUnit: 'mg' }],
      solvents: [{ id: '1', name: '', amount: 0, amountUnit: 'mL' }],
      vessels: [{ id: '1', volume: 0, volumeUnit: 'mL', material: '', type: 'Vial', purpose: 'Reaction' }],
      hardware: [{ id: '1', purpose: 'Heating/Cooling', generalName: '' }],
      steps: [{ id: '1', type: 'Preparation', atmosphere: 'Air', detail: '' }],
      procedureFull: ''
    }
  });

  const { fields: substrateFields, append: appendSubstrate, remove: removeSubstrate } = useFieldArray({
    control,
    name: 'substrates'
  });

  const { fields: solventFields, append: appendSolvent, remove: removeSolvent } = useFieldArray({
    control,
    name: 'solvents'
  });

  const { fields: vesselFields, append: appendVessel, remove: removeVessel } = useFieldArray({
    control,
    name: 'vessels'
  });


  const { fields: hardwareFields, append: appendHardware, remove: removeHardware } = useFieldArray({
    control,
    name: 'hardware'
  });



  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
    control,
    name: 'steps'
  });

  // Watch for changes to trigger unsaved state
  const watchedFields = watch();
  if (isDirty) {
    onUnsavedChange();
  }

  const onSubmit = (formData: SynthesisDetails) => {
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Substrates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Substrates
            <Button
              type="button"
              size="sm"
              onClick={() => appendSubstrate({ id: Date.now().toString(), name: '', amount: 0, amountUnit: 'mg' })}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Substrate
            </Button>
          </CardTitle>
          <CardDescription>
            Raw materials and reactants used in the synthesis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {substrateFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor={`substrates.${index}.name`}>Name *</Label>
                <Input
                  {...register(`substrates.${index}.name`, { required: 'Name is required' })}
                  placeholder="Zinc nitrate hexahydrate"
                />
                {errors.substrates?.[index]?.name && (
                  <p className="text-sm text-red-600">{errors.substrates[index]?.name?.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`substrates.${index}.molarity`}>Molarity</Label>
                <Input
                  type="number"
                  step="0.0001"
                  {...register(`substrates.${index}.molarity`, { valueAsNumber: true, min: { value: 0, message: 'Must be positive' } })}
                  placeholder="0.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`substrates.${index}.molarityUnit`}>Molarity Unit</Label>
                <select
                  {...register(`substrates.${index}.molarityUnit`)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  <option value="μmol">μmol</option>
                  <option value="mmol">mmol</option>
                  <option value="mol">mol</option>
                  <option value="kmol">kmol</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`substrates.${index}.amount`}>Amount *</Label>
                <Input
                  type="number"
                  step="0.001"
                  {...register(`substrates.${index}.amount`, { 
                    required: 'Amount is required',
                    valueAsNumber: true,
                    min: { value: 0, message: 'Amount must be positive' }
                  })}
                  placeholder="1.25"
                />
                {errors.substrates?.[index]?.amount && (
                  <p className="text-sm text-red-600">{errors.substrates[index]?.amount?.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`substrates.${index}.amountUnit`}>Unit *</Label>
                <select
                  {...register(`substrates.${index}.amountUnit`, { required: 'Unit is required' })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="mg">mg</option>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="μL">μL</option>
                  <option value="mL">mL</option>
                  <option value="L">L</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`substrates.${index}.supplier`}>Supplier</Label>
                <Input
                  {...register(`substrates.${index}.supplier`)}
                  placeholder="Supplier name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`substrates.${index}.purity`}>Purity (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  {...register(`substrates.${index}.purity`, { valueAsNumber: true, min: { value: 0, message: '>= 0' }, max: { value: 100, message: '<= 100' } })}
                  placeholder="99.9"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`substrates.${index}.casNumber`}>CAS</Label>
                <Input
                  {...register(`substrates.${index}.casNumber`)}
                  placeholder="12345-67-8"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={`substrates.${index}.smiles`}>SMILES</Label>
                <Input
                  {...register(`substrates.${index}.smiles`)}
                  placeholder="SMILES string"
                />
              </div>

              <div className="flex items-end">
                {substrateFields.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSubstrate(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Solvents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Solvents
            <Button
              type="button"
              size="sm"
              onClick={() => appendSolvent({ id: Date.now().toString(), name: '', amount: 0, amountUnit: 'mL' })}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Solvent
            </Button>
          </CardTitle>
          <CardDescription>
            Solvents and reaction media
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {solventFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor={`solvents.${index}.name`}>Name *</Label>
                <Input
                  {...register(`solvents.${index}.name`, { required: 'Name is required' })}
                  placeholder="DMF, water, ethanol"
                />
                {errors.solvents?.[index]?.name && (
                  <p className="text-sm text-red-600">{errors.solvents[index]?.name?.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`solvents.${index}.molarity`}>Molarity</Label>
                <Input
                  type="number"
                  step="0.0001"
                  {...register(`solvents.${index}.molarity`, { valueAsNumber: true, min: { value: 0, message: 'Must be positive' } })}
                  placeholder="0.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`solvents.${index}.molarityUnit`}>Molarity Unit</Label>
                <select
                  {...register(`solvents.${index}.molarityUnit`)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  <option value="μmol">μmol</option>
                  <option value="mmol">mmol</option>
                  <option value="mol">mol</option>
                  <option value="kmol">kmol</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`solvents.${index}.amount`}>Amount *</Label>
                <Input
                  type="number"
                  step="0.001"
                  {...register(`solvents.${index}.amount`, { 
                    required: 'Amount is required',
                    valueAsNumber: true,
                    min: { value: 0, message: 'Amount must be positive' }
                  })}
                  placeholder="10.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`solvents.${index}.amountUnit`}>Unit *</Label>
                <select
                  {...register(`solvents.${index}.amountUnit`, { required: 'Unit is required' })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="μL">μL</option>
                  <option value="mL">mL</option>
                  <option value="L">L</option>
                  <option value="mg">mg</option>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`solvents.${index}.supplier`}>Supplier</Label>
                <Input
                  {...register(`solvents.${index}.supplier`)}
                  placeholder="Supplier name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`solvents.${index}.purity`}>Purity (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  {...register(`solvents.${index}.purity`, { valueAsNumber: true, min: { value: 0, message: '>= 0' }, max: { value: 100, message: '<= 100' } })}
                  placeholder="99.9"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`solvents.${index}.casNumber`}>CAS</Label>
                <Input
                  {...register(`solvents.${index}.casNumber`)}
                  placeholder="12345-67-8"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={`solvents.${index}.smiles`}>SMILES</Label>
                <Input
                  {...register(`solvents.${index}.smiles`)}
                  placeholder="SMILES string"
                />
              </div>

              <div className="flex items-end">
                {solventFields.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSolvent(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Vessels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Vessels
            <Button
              type="button"
              size="sm"
              onClick={() => appendVessel({ 
                id: Date.now().toString(), 
                volume: 0, 
                volumeUnit: 'mL', 
                material: '', 
                type: 'Vial', 
                purpose: 'Reaction' 
              })}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Vessel
            </Button>
          </CardTitle>
          <CardDescription>
            Reaction vessels and containers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {vesselFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-8 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor={`vessels.${index}.type`}>Type *</Label>
                <select
                  {...register(`vessels.${index}.type`, { required: 'Type is required' })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Vial">Vial</option>
                  <option value="Jar">Jar</option>
                  <option value="Autoclave">Autoclave</option>
                  <option value="Beaker">Beaker</option>
                  <option value="Flask">Flask</option>
                  <option value="Centrifuge-tube">Centrifuge Tube</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`vessels.${index}.volume`}>Volume *</Label>
                <Input
                  type="number"
                  step="0.1"
                  {...register(`vessels.${index}.volume`, { 
                    required: 'Volume is required',
                    valueAsNumber: true,
                    min: { value: 0, message: 'Volume must be positive' }
                  })}
                  placeholder="20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`vessels.${index}.volumeUnit`}>Unit *</Label>
                <select
                  {...register(`vessels.${index}.volumeUnit`, { required: 'Unit is required' })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="μL">μL</option>
                  <option value="mL">mL</option>
                  <option value="L">L</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`vessels.${index}.material`}>Material *</Label>
                <Input
                  {...register(`vessels.${index}.material`, { required: 'Material is required' })}
                  placeholder="Glass, PTFE, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`vessels.${index}.purpose`}>Purpose *</Label>
                <select
                  {...register(`vessels.${index}.purpose`, { required: 'Purpose is required' })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Storing">Storing</option>
                  <option value="Reaction">Reaction</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`vessels.${index}.supplier`}>Supplier</Label>
                <Input
                  {...register(`vessels.${index}.supplier`)}
                  placeholder="Supplier name"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={`vessels.${index}.note`}>Note</Label>
                <Input
                  {...register(`vessels.${index}.note`)}
                  placeholder="Special notes about the vessel"
                />
              </div>

              <div className="flex items-end">
                {vesselFields.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeVessel(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Hardware */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Hardware
            <Button
              type="button"
              size="sm"
              onClick={() => appendHardware({ id: Date.now().toString(), purpose: 'Heating/Cooling', generalName: '', productName: '', supplier: '', note: '' })}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Hardware
            </Button>
          </CardTitle>
          <CardDescription>
            Equipment and devices used during synthesis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hardwareFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor={`hardware.${index}.purpose`}>Purpose *</Label>
                <select
                  {...register(`hardware.${index}.purpose`, { required: 'Purpose is required' })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Heating/Cooling">Temperature control</option>
                  <option value="Atmosphere-control">Atmosphere control</option>
                  <option value="Stirring/Mixing">Mixing</option>
                  <option value="Synthesis-devise">Synthesis devise</option>
                  <option value="Transferring">Transferring</option>
                  <option value="Separation">Separation</option>
                  <option value="Drying">Drying</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`hardware.${index}.generalName`}>General Name *</Label>
                <Input
                  {...register(`hardware.${index}.generalName`, { required: 'General name is required' })}
                  placeholder="Hot plate, oven, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`hardware.${index}.productName`}>Product Name</Label>
                <Input
                  {...register(`hardware.${index}.productName`)}
                  placeholder="Model/brand"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`hardware.${index}.supplier`}>Supplier</Label>
                <Input
                  {...register(`hardware.${index}.supplier`)}
                  placeholder="Supplier name"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={`hardware.${index}.note`}>Note</Label>
                <Input
                  {...register(`hardware.${index}.note`)}
                  placeholder="Special notes about the hardware"
                />
              </div>

              <div className="flex items-end">
                {hardwareFields.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeHardware(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Procedure Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Procedure Steps
            <Button
              type="button"
              size="sm"
              onClick={() => appendStep({ id: Date.now().toString(), type: 'Preparation', atmosphere: 'Air', detail: '' })}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Step
            </Button>
          </CardTitle>
          <CardDescription>
            Detailed synthesis procedure steps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {stepFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor={`steps.${index}.type`}>Step Type *</Label>
                <select
                  {...register(`steps.${index}.type`, { required: 'Type is required' })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Preparation">Preparation</option>
                  <option value="Reaction">Reaction</option>
                  <option value="Work-up">Work-up</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`steps.${index}.atmosphere`}>Atmosphere *</Label>
                <select
                  {...register(`steps.${index}.atmosphere`, { required: 'Atmosphere is required' })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Air">Air</option>
                  <option value="Dry">Dry</option>
                  <option value="Inert">Inert</option>
                  <option value="Vacuum">Vacuum</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-end">
                {stepFields.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeStep(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-2 md:col-span-3">
                <Label htmlFor={`steps.${index}.detail`}>Step Details *</Label>
                <textarea
                  {...register(`steps.${index}.detail`, { required: 'Details are required' })}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Describe this step in detail..."
                />
                {errors.steps?.[index]?.detail && (
                  <p className="text-sm text-red-600">{errors.steps[index]?.detail?.message}</p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Full Procedure */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Procedure</CardTitle>
          <CardDescription>
            Full synthesis procedure as a continuous text
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="procedureFull">Full Procedure</Label>
            <textarea
              id="procedureFull"
              {...register('procedureFull')}
              className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Provide the complete synthesis procedure as continuous text..."
            />
            <p className="text-xs text-muted-foreground">
              Optional: Complete procedure description in paragraph form
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={!isDirty}>
          Save Synthesis Details
        </Button>
      </div>
    </form>
  );
} 