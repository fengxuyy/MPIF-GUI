import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthorDetails } from '@/types/mpif';

interface AuthorDetailsFormProps {
  data?: AuthorDetails;
  onSave: (data: AuthorDetails) => void;
  onUnsavedChange: () => void;
}

export function AuthorDetailsForm({ data, onSave, onUnsavedChange }: AuthorDetailsFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<AuthorDetails>({
    defaultValues: data || {
      name: '',
      email: '',
      orcid: '',
      address: '',
      phone: ''
    }
  });

  // Watch for changes to trigger unsaved state
  const watchedFields = watch();
  if (isDirty) {
    onUnsavedChange();
  }

  const onSubmit = (formData: AuthorDetails) => {
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contact Author Information</CardTitle>
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

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={!isDirty}>
          Save Author Details
        </Button>
      </div>
    </form>
  );
} 