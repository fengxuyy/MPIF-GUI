import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MPIFMetadata } from '@/types/mpif';
import { EditableSelect } from '../ui/EditableSelect';
import { useEffect } from 'react';

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
    getValues,
  } = useForm<MPIFMetadata>({
    defaultValues: data || {
      dataName: '',
      creationDate: new Date().toISOString().split('T')[0],
      generatorVersion: '1.0.0',
      procedureStatus: 'test',
      publicationDOI: '',
      name: '',
      email: '',
      orcid: '',
      address: '',
      phone: ''
    }
  });

  // Watch for changes to trigger unsaved state
  if (isDirty) {
    onUnsavedChange();
  }

  const onSubmit = (formData: MPIFMetadata) => {
    onSave(formData);
  };

  useEffect(() => {
    const handleBlur = () => {
      if (isDirty) {
        onSave(getValues());
      }
    };

    const formElement = document.querySelector('form');
    formElement?.addEventListener('focusout', handleBlur);

    return () => {
      formElement?.removeEventListener('focusout', handleBlur);
    };
  }, [isDirty, onSave, getValues]);

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
            <div className="space-y-2 md:col-span-2">
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Author Information</CardTitle>
          <CardDescription>
            Details of the primary author or contact person for this synthesis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                {...register('name', { 
                  required: 'Author name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters'
                  }
                })}
                placeholder="Dr. Jane Smith"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                placeholder="jane.smith@university.edu"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="orcid">ORCID ID *</Label>
              <Input
                id="orcid"
                {...register('orcid', {
                  required: 'ORCID is required',
                  pattern: {
                    value: /^[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{3}[0-9X]$/,
                    message: 'ORCID format: 0000-0000-0000-0000'
                  }
                })}
                placeholder="0000-0000-0000-0000"
              />
              {errors.orcid && (
                <p className="text-sm text-red-600">{errors.orcid.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Required for author identification
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <textarea
                id="address"
                {...register('address')}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Department of Chemistry&#10;University of Science&#10;123 Research Blvd&#10;Science City, SC 12345, USA"
              />
            </div>

          </div>
        </CardContent>
      </Card>

    </form>
  );
} 