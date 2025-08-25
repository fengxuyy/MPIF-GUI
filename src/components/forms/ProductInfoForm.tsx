import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductInfo } from '@/types/mpif';
import { useState } from 'react';
import { CIFFileUpload } from '../ui/CIFFileUpload';

interface ProductInfoFormProps {
  data?: ProductInfo;
  onSave: (data: ProductInfo) => void;
  onUnsavedChange: () => void;
}

export function ProductInfoForm({ data, onSave, onUnsavedChange }: ProductInfoFormProps) {
  const [cifContent, setCifContent] = useState(data?.cif || '');
  const [cifFileName, setCifFileName] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProductInfo>({
    defaultValues: data || {
      type: 'porous framework material',
      commonName: '',
      state: 'solid',
      color: '',
      handlingAtmosphere: 'air',
      casNumber: '',
      ccdcNumber: '',
      systematicName: '',
      formula: '',
      formulaWeight: undefined,
      handlingNote: ''
    }
  });

  // Watch for changes to trigger unsaved state
  const watchedFields = watch();
  const hasChanges = isDirty || cifContent !== (data?.cif || '');
  if (hasChanges) {
    onUnsavedChange();
  }

  const onSubmit = (formData: ProductInfo) => {
    // Include CIF content if provided
    if (cifContent.trim()) {
      formData.cif = cifContent;
    }
    onSave(formData);
  };

  const handleCifFileLoad = (content: string, filename: string) => {
    setCifContent(content);
    setCifFileName(filename);
    onUnsavedChange();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              <select
                id="type"
                {...register('type', { required: 'Material type is required' })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="porous framework material">Porous Framework Material</option>
                <option value="inorganic">Inorganic</option>
                <option value="organic">Organic</option>
                <option value="composite">Composite</option>
                <option value="other">Other</option>
              </select>
              {errors.type && (
                <p className="text-sm text-red-600">{errors.type.message}</p>
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
                placeholder="MOF-5, ZIF-8, UiO-66, etc."
              />
              {errors.commonName && (
                <p className="text-sm text-red-600">{errors.commonName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Physical State *</Label>
              <select
                id="state"
                {...register('state', { required: 'Physical state is required' })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="solid">Solid</option>
                <option value="liquid">Liquid</option>
                <option value="gas">Gas</option>
                <option value="suspension">Suspension</option>
                <option value="other">Other</option>
              </select>
              {errors.state && (
                <p className="text-sm text-red-600">{errors.state.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color *</Label>
              <Input
                id="color"
                {...register('color', { 
                  required: 'Color is required' 
                })}
                placeholder="Colorless, white, blue, etc."
              />
              {errors.color && (
                <p className="text-sm text-red-600">{errors.color.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="handlingAtmosphere">Handling Atmosphere *</Label>
              <select
                id="handlingAtmosphere"
                {...register('handlingAtmosphere', { required: 'Handling atmosphere is required' })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="air">Air</option>
                <option value="inert">Inert</option>
                <option value="water-free">Water-free</option>
                <option value="oxygen-free">Oxygen-free</option>
                <option value="other">Other</option>
              </select>
              {errors.handlingAtmosphere && (
                <p className="text-sm text-red-600">{errors.handlingAtmosphere.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="formula">Chemical Formula</Label>
              <Input
                id="formula"
                {...register('formula')}
                placeholder="Zn4O(BDC)3"
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
                placeholder="543.21"
              />
              {errors.formulaWeight && (
                <p className="text-sm text-red-600">{errors.formulaWeight.message}</p>
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
                placeholder="123456-78-9"
              />
              {errors.casNumber && (
                <p className="text-sm text-red-600">{errors.casNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ccdcNumber">CCDC Number</Label>
              <Input
                id="ccdcNumber"
                {...register('ccdcNumber')}
                placeholder="CCDC 123456"
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
                placeholder="Full IUPAC systematic name if known"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="handlingNote">Handling Notes</Label>
            <textarea
              id="handlingNote"
              {...register('handlingNote')}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Special handling requirements, safety notes, storage conditions..."
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
                <p className="text-xs font-mono text-muted-foreground">
                  {cifContent.split('\n').slice(0, 5).join('\n')}
                  {cifContent.split('\n').length > 5 && '\n...'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {cifContent.split('\n').length} lines, {cifContent.length} characters
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={!hasChanges}>
          Save Product Information
        </Button>
      </div>
    </form>
  );
} 