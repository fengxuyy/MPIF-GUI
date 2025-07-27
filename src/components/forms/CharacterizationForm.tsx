import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Characterization, PXRDData, TGAData } from '@/types/mpif';
import { useState } from 'react';
import { DataVisualization } from '../DataVisualization';

interface CharacterizationFormProps {
  data?: Characterization;
  onSave: (data: Characterization) => void;
  onUnsavedChange: () => void;
}

export function CharacterizationForm({ data, onSave, onUnsavedChange }: CharacterizationFormProps) {
  const [pxrdDataText, setPxrdDataText] = useState('');
  const [tgaDataText, setTgaDataText] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<Characterization>({
    defaultValues: data || {
      pxrd: undefined,
      tga: undefined,
      aif: ''
    }
  });

  // Watch for changes to trigger unsaved state
  const watchedFields = watch();
  if (isDirty) {
    onUnsavedChange();
  }

  const parsePXRDData = (text: string): PXRDData['data'] => {
    try {
      const lines = text.trim().split('\n');
      const data: PXRDData['data'] = [];
      
      for (const line of lines) {
        if (line.trim() === '') continue;
        const [twoTheta, intensity] = line.split(/[\t,\s]+/).map(Number);
        if (!isNaN(twoTheta) && !isNaN(intensity)) {
          data.push({ twoTheta, intensity });
        }
      }
      
      return data;
    } catch {
      return [];
    }
  };

  const parseTGAData = (text: string): TGAData['data'] => {
    try {
      const lines = text.trim().split('\n');
      const data: TGAData['data'] = [];
      
      for (const line of lines) {
        if (line.trim() === '') continue;
        const [temperature, weightPercent] = line.split(/[\t,\s]+/).map(Number);
        if (!isNaN(temperature) && !isNaN(weightPercent)) {
          data.push({ temperature, weightPercent });
        }
      }
      
      return data;
    } catch {
      return [];
    }
  };

  const onSubmit = (formData: Characterization) => {
    // Parse PXRD data if provided
    if (pxrdDataText.trim()) {
      const pxrdData = parsePXRDData(pxrdDataText);
      formData.pxrd = {
        source: (formData.pxrd?.source as any) || 'Cu',
        wavelength: formData.pxrd?.wavelength,
        data: pxrdData
      };
    }

    // Parse TGA data if provided
    if (tgaDataText.trim()) {
      const tgaData = parseTGAData(tgaDataText);
      formData.tga = {
        data: tgaData
      };
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* PXRD Data */}
      <Card>
        <CardHeader>
          <CardTitle>Powder X-Ray Diffraction (PXRD)</CardTitle>
          <CardDescription>
            X-ray diffraction pattern and experimental conditions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pxrd.source">X-ray Source</Label>
              <select
                id="pxrd.source"
                {...register('pxrd.source')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select source...</option>
                <option value="Cu">Cu Kα</option>
                <option value="Cr">Cr Kα</option>
                <option value="Fe">Fe Kα</option>
                <option value="Co">Co Kα</option>
                <option value="Mo">Mo Kα</option>
                <option value="Ag">Ag Kα</option>
                <option value="synchrotron">Synchrotron</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pxrd.wavelength">Wavelength (Å)</Label>
              <Input
                id="pxrd.wavelength"
                type="number"
                step="0.0001"
                {...register('pxrd.wavelength', {
                  valueAsNumber: true,
                  min: { value: 0, message: 'Wavelength must be positive' }
                })}
                placeholder="1.5418"
              />
              {errors.pxrd?.wavelength && (
                <p className="text-sm text-red-600">{errors.pxrd.wavelength.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Typical Cu Kα: 1.5418 Å
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pxrdData">PXRD Data</Label>
            <textarea
              id="pxrdData"
              value={pxrdDataText}
              onChange={(e) => setPxrdDataText(e.target.value)}
              className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
              placeholder="2-Theta    Intensity&#10;5.0        1234&#10;5.1        1345&#10;5.2        1567&#10;...&#10;&#10;Format: Two columns separated by spaces, tabs, or commas"
            />
            <p className="text-xs text-muted-foreground">
              Enter 2θ (degrees) and intensity values, one per line
            </p>
          </div>
        </CardContent>
      </Card>

      {/* TGA Data */}
      <Card>
        <CardHeader>
          <CardTitle>Thermogravimetric Analysis (TGA)</CardTitle>
          <CardDescription>
            Thermal decomposition and weight loss data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tgaData">TGA Data</Label>
            <textarea
              id="tgaData"
              value={tgaDataText}
              onChange={(e) => setTgaDataText(e.target.value)}
              className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
              placeholder="Temperature(°C)    Weight(%)&#10;25                  100.0&#10;50                  99.8&#10;100                 98.5&#10;...&#10;&#10;Format: Two columns separated by spaces, tabs, or commas"
            />
            <p className="text-xs text-muted-foreground">
              Enter temperature (°C) and weight percentage values, one per line
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Adsorption Isotherm File */}
      <Card>
        <CardHeader>
          <CardTitle>Gas Adsorption Data</CardTitle>
          <CardDescription>
            Adsorption isotherm file path or data reference
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aif">AIF File Path/Reference</Label>
            <Input
              id="aif"
              {...register('aif')}
              placeholder="path/to/adsorption_data.aif or reference to external data"
            />
            <p className="text-xs text-muted-foreground">
              Reference to adsorption isotherm file or external data source
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Preview */}
      {(pxrdDataText.trim() || tgaDataText.trim()) && (
        <Card>
          <CardHeader>
            <CardTitle>Data Preview</CardTitle>
            <CardDescription>
              Preview of parsed characterization data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pxrdDataText.trim() && (
              <div>
                <h4 className="text-sm font-medium mb-2">PXRD Data Points:</h4>
                <p className="text-sm text-muted-foreground">
                  {parsePXRDData(pxrdDataText).length} data points parsed
                </p>
                {parsePXRDData(pxrdDataText).length > 0 && (
                  <div className="bg-muted/50 p-3 rounded-lg mt-2">
                    <p className="text-xs font-mono">
                      Range: 2θ = {Math.min(...parsePXRDData(pxrdDataText).map(p => p.twoTheta)).toFixed(2)}° - {Math.max(...parsePXRDData(pxrdDataText).map(p => p.twoTheta)).toFixed(2)}°
                    </p>
                    <p className="text-xs font-mono">
                      Intensity: {Math.min(...parsePXRDData(pxrdDataText).map(p => p.intensity)).toFixed(0)} - {Math.max(...parsePXRDData(pxrdDataText).map(p => p.intensity)).toFixed(0)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {tgaDataText.trim() && (
              <div>
                <h4 className="text-sm font-medium mb-2">TGA Data Points:</h4>
                <p className="text-sm text-muted-foreground">
                  {parseTGAData(tgaDataText).length} data points parsed
                </p>
                {parseTGAData(tgaDataText).length > 0 && (
                  <div className="bg-muted/50 p-3 rounded-lg mt-2">
                    <p className="text-xs font-mono">
                      Temperature: {Math.min(...parseTGAData(tgaDataText).map(p => p.temperature)).toFixed(0)}°C - {Math.max(...parseTGAData(tgaDataText).map(p => p.temperature)).toFixed(0)}°C
                    </p>
                    <p className="text-xs font-mono">
                      Weight: {Math.min(...parseTGAData(tgaDataText).map(p => p.weightPercent)).toFixed(1)}% - {Math.max(...parseTGAData(tgaDataText).map(p => p.weightPercent)).toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Live Visualization */}
      {(pxrdDataText.trim() || tgaDataText.trim()) && (
        <DataVisualization 
          pxrdData={pxrdDataText.trim() ? {
            source: (watch('pxrd.source') as any) || 'Cu',
            wavelength: watch('pxrd.wavelength'),
            data: parsePXRDData(pxrdDataText)
          } : undefined}
          tgaData={tgaDataText.trim() ? {
            data: parseTGAData(tgaDataText)
          } : undefined}
        />
      )}

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={!isDirty}>
          Save Characterization Data
        </Button>
      </div>
    </form>
  );
} 