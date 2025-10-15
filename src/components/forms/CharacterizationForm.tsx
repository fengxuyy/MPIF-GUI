import { useForm, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Characterization } from '@/types/mpif';
import { useState, useEffect } from 'react';
import { DataVisualization } from '../DataVisualization';
import { AIFFileUpload } from '../ui/AIFFileUpload';
import { EditableSelect } from '../ui/EditableSelect';
import { useMPIFStore } from '@/store/mpifStore';
import { parsePXRDData, parseTGAData } from '@/utils/parsing';

interface CharacterizationFormProps {
  data: Characterization;
  onSave: (data: Characterization) => void;
  onUnsavedChange: () => void;
}

export function CharacterizationForm({ data, onSave, onUnsavedChange }: CharacterizationFormProps) {
  const { dashboard } = useMPIFStore();
  // Convert structured AIF to string for display
  const getAifString = (aif: any) => {
    if (!aif) return '';
    if (typeof aif === 'string') return aif;
    // If it's structured, keep it as-is (we'll just show "[Structured AIF Data]")
    return '[Structured AIF Data]';
  };
  const [pxrdDataText, setPxrdDataText] = useState('');
  const [tgaDataText, setTgaDataText] = useState('');
  const [aifContent, setAifContent] = useState(getAifString(data?.aif));
  const [aifFileName, setAifFileName] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isDirty },
    getValues,
    reset,
  } = useForm<Characterization>({
    defaultValues: data || {
      pxrd: undefined,
      tga: undefined,
      aif: ''
    }
  });

  // Reset form when data changes
  useEffect(() => {
    reset(data);
    setAifContent(getAifString(data?.aif));
    setAifFileName('');
    setPxrdDataText('');
    setTgaDataText('');
  }, [data, reset]);

  // Watch for changes to trigger unsaved state and auto-save
  const watchedFields = watch();
  const hasChanges = isDirty || aifContent !== getAifString(data?.aif);

  const processData = (formData: Characterization) => {
    // Parse PXRD data if provided
    if (pxrdDataText.trim()) {
      const pxrdData = parsePXRDData(pxrdDataText);
      formData.pxrd = {
        ...(formData.pxrd || {}),
        source: formData.pxrd?.source || 'Cu',
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

    // Include AIF content if provided
    const aifStr = typeof aifContent === 'string' ? aifContent.trim() : '';
    if (aifStr && aifStr !== '[Structured AIF Data]') {
      formData.aif = aifContent;
    } else if (data?.aif && typeof data.aif !== 'string') {
      // Keep structured AIF if it exists
      formData.aif = data.aif;
    }

    return formData;
  };

  useEffect(() => {
    if (hasChanges) {
      onUnsavedChange();
      // Auto-save after a short delay
      const timeoutId = setTimeout(() => {
        const formData = getValues();
        const processedData = processData(formData);
        onSave(processedData);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [watchedFields, aifContent, data, onUnsavedChange, hasChanges, onSave, getValues, pxrdDataText, tgaDataText]);

  const onSubmit = (formData: Characterization) => {
    const processedData = processData(formData);
    onSave(processedData);
  };


  const handleAifFileLoad = (content: string, filename: string) => {
    setAifContent(content);
    setAifFileName(filename);
    onUnsavedChange();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className={(dashboard as any).columnLayout === 'double' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'grid grid-cols-1 gap-6'}>
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
              <Controller
                name="pxrd.source"
                control={control}
                render={({ field }) => (
                  <EditableSelect
                    {...field}
                    value={field.value || ''}
                    options={['Cu', 'Cr', 'Fe', 'Co', 'Mo', 'Ag', 'synchrotron']}
                  />
                )}
              />
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
            Upload adsorption isotherm file (AIF format)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>AIF File Upload</Label>
            <AIFFileUpload 
              onFileLoad={handleAifFileLoad}
              currentFileName={aifFileName}
            />
            <p className="text-xs text-muted-foreground">
              Upload an Adsorption Information Format (.aif) file containing gas adsorption data
            </p>
            {aifContent && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs font-medium mb-1">File Content Preview:</p>
                {typeof aifContent === 'string' ? (
                  <>
                    <p className="text-xs font-mono text-muted-foreground">
                      {aifContent.split('\n').slice(0, 3).join('\n')}
                      {aifContent.split('\n').length > 3 && '\n...'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {aifContent.split('\n').length} lines, {aifContent.length} characters
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Structured AIF data loaded
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>

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
        {/* <Button type="submit" disabled={!hasChanges}>
          Save Characterization Data
        </Button> */}
      </div>
    </form>
  );
} 