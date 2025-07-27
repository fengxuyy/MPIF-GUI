import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
// import { useMPIFStore } from '@/store/mpifStore';

interface FileUploadProps {
  onFileLoad?: (content: string, fileName: string) => void;
  className?: string;
}

export function FileUpload({ onFileLoad, className }: FileUploadProps) {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  // const loadMPIFFile = useMPIFStore((state) => state.loadMPIFFile);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file extension
    if (!file.name.toLowerCase().endsWith('.mpif')) {
      setUploadStatus('error');
      setErrorMessage('Please upload a .mpif file');
      return;
    }

    setUploadStatus('loading');
    setErrorMessage('');

    try {
      const content = await file.text();
      
      // Basic validation - check if it looks like MPIF format
      if (!content.includes('data_') && !content.includes('_mpif_')) {
        throw new Error('File does not appear to be a valid MPIF file');
      }

      setUploadStatus('success');
      
      // Call the callback or store action
      if (onFileLoad) {
        onFileLoad(content, file.name);
      } else {
        // loadMPIFFile(content, file.name);
      }

      // Reset status after a delay
      setTimeout(() => {
        setUploadStatus('idle');
      }, 2000);

    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to read file');
    }
  }, [onFileLoad]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.mpif'],
      'application/octet-stream': ['.mpif']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB limit
  });

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'loading':
        return <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />;
      case 'success':
        return <CheckCircle2 className="h-8 w-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Upload className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const getStatusMessage = () => {
    switch (uploadStatus) {
      case 'loading':
        return 'Reading file...';
      case 'success':
        return 'File loaded successfully!';
      case 'error':
        return errorMessage || 'Upload failed';
      default:
        return isDragActive 
          ? 'Drop the MPIF file here...' 
          : 'Drag and drop a .mpif file here, or click to browse';
    }
  };

  const getStatusColor = () => {
    switch (uploadStatus) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'loading':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            'hover:border-primary/50 hover:bg-accent/50',
            isDragActive && 'border-primary bg-primary/5',
            isDragReject && 'border-red-500 bg-red-50 dark:bg-red-900/10',
            uploadStatus === 'error' && 'border-red-500',
            uploadStatus === 'success' && 'border-green-500'
          )}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center space-y-4">
            {getStatusIcon()}
            
            <div className="space-y-2">
              <p className={cn('text-lg font-medium', getStatusColor())}>
                {getStatusMessage()}
              </p>
              
              {uploadStatus === 'idle' && (
                <>
                  <p className="text-sm text-muted-foreground">
                    Supports .mpif files up to 10MB
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <File className="h-4 w-4" />
                    <span>MPIF (Material Preparation Information File)</span>
                  </div>
                </>
              )}
              
              {uploadStatus === 'error' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadStatus('idle');
                    setErrorMessage('');
                  }}
                >
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {uploadStatus === 'idle' && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              <File className="h-4 w-4 mr-2" />
              Browse Files
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default FileUpload; 