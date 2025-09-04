import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MPIFMetadata } from '@/types/mpif';
import { EditableSelect } from '../ui/EditableSelect';

interface MetadataFormProps {
  data?: MPIFMetadata;
  onSave: (data: MPIFMetadata) => void;
  onUnsavedChange: () => void;
}

export function MetadataForm({ data, onSave, onUnsavedChange }: MetadataFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<MPIFMetadata>({
    defaultValues: data || {
      dataName: '',
      creationDate: new Date().toISOString().split('T')[0],
      generatorVersion: '1.0.0',
      procedureStatus: 'test',
      publicationDOI: ''
    }
  });

  // Watch for changes to trigger unsaved state
  if (isDirty) {
    onUnsavedChange();
  }

  const onSubmit = (formData: MPIFMetadata) => {
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Essential metadata for this MPIF file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataName">Data Name *</Label>
              <Input
                id="dataName"
                {...register('dataName', { 
                  required: 'Data name is required',
                  pattern: {
                    value: /^[A-Za-z0-9_-]+$/,
                    message: 'Only letters, numbers, underscores, and hyphens allowed'
                  }
                })}
                placeholder="e.g., MOF-5_synthesis_001"
              />
              {errors.dataName && (
                <p className="text-sm text-red-600">{errors.dataName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="procedureStatus">Procedure Status *</Label>
              <Controller
                name="procedureStatus"
                control={control}
                rules={{ required: 'Status is required' }}
                render={({ field }) => (
                  <EditableSelect
                    {...field}
                    options={['test', 'success', 'failure']}
                  />
                )}
              />
              {errors.procedureStatus && (
                <p className="text-sm text-red-600">{errors.procedureStatus.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="creationDate">Creation Date *</Label>
              <Input
                id="creationDate"
                type="date"
                {...register('creationDate', { required: 'Creation date is required' })}
              />
              {errors.creationDate && (
                <p className="text-sm text-red-600">{errors.creationDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="generatorVersion">Generator Version</Label>
              <Input
                id="generatorVersion"
                {...register('generatorVersion')}
                placeholder="1.0.0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Optional Metadata</CardTitle>
          <CardDescription>
            Additional information about this procedure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="publicationDOI">Publication DOI</Label>
            <Input
              id="publicationDOI"
              {...register('publicationDOI', {
                pattern: {
                  value: /^10\.\d{4,}\/\S+/,
                  message: 'Invalid DOI format (should start with 10.)'
                }
              })}
              placeholder="10.1021/jacs.1234567"
            />
            {errors.publicationDOI && (
              <p className="text-sm text-red-600">{errors.publicationDOI.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              DOI of related publication if available
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={!isDirty}>
          Save Metadata
        </Button>
      </div>
    </form>
  );
} 