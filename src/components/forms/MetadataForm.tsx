import { useForm, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MPIFMetadata } from '@/types/mpif';
import { EditableSelect } from '../ui/EditableSelect';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useMPIFStore } from '@/store/mpifStore';

interface ValidationError {
  field: string;
  message: string;
  section: string;
}

interface MetadataFormProps {
  data?: MPIFMetadata;
  onSave: (data: MPIFMetadata) => void;
  onUnsavedChange: () => void;
  errors?: ValidationError[];
}

export function MetadataForm({ data, onSave, onUnsavedChange, errors = [] }: MetadataFormProps) {
  const { dashboard } = useMPIFStore();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors: formErrors, isDirty },
    getValues,
    reset,
  } = useForm<MPIFMetadata>({
    defaultValues: data || {
      dataName: '',
      creationDate: new Date().toISOString().split('T')[0],
      generatorVersion: '1.0',
      procedureStatus: '',
      publicationDOI: '',
      name: '',
      email: '',
      orcid: '',
      address: '',
      phone: ''
    }
  });

  // Helper function to check if a field has validation errors
  const hasValidationError = (fieldName: string) => {
    return errors.some(error => error.field === fieldName);
  };

  const onSubmit = (formData: MPIFMetadata) => {
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
                className={cn(hasValidationError('dataName') && "border-red-500 ring-red-500")}
              />
              {formErrors.dataName && (
                <p className="text-sm text-red-600">{formErrors.dataName.message}</p>
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
                    className={cn(hasValidationError('procedureStatus') && "border-red-500 ring-red-500")}
                  />
                )}
              />
              {formErrors.procedureStatus && (
                <p className="text-sm text-red-600">{formErrors.procedureStatus.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="creationDate">Creation Date *</Label>
              <Input
                id="creationDate"
                type="date"
                {...register('creationDate', { required: 'Creation date is required' })}
                className={cn(hasValidationError('creationDate') && "border-red-500 ring-red-500")}
              />
              {formErrors.creationDate && (
                <p className="text-sm text-red-600">{formErrors.creationDate.message}</p>
              )}
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
                className={cn(hasValidationError('publicationDOI') && "border-red-500 ring-red-500")}
              />
              {formErrors.publicationDOI && (
                <p className="text-sm text-red-600">{formErrors.publicationDOI.message}</p>
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
                className={cn(hasValidationError('name') && "border-red-500 ring-red-500")}
              />
              {formErrors.name && (
                <p className="text-sm text-red-600">{formErrors.name.message}</p>
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
                className={cn(hasValidationError('email') && "border-red-500 ring-red-500")}
              />
              {formErrors.email && (
                <p className="text-sm text-red-600">{formErrors.email.message}</p>
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
                className={cn(hasValidationError('orcid') && "border-red-500 ring-red-500")}
              />
              {formErrors.orcid && (
                <p className="text-sm text-red-600">{formErrors.orcid.message}</p>
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
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <textarea
                id="address"
                {...register('address')}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

          </div>
        </CardContent>
      </Card>
      </div>
    </form>
  );
} 