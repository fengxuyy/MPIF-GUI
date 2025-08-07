import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div
      {...getRootProps()}
      className={cn(
        'relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200',
        'hover:border-primary/60 hover:bg-primary/5',
        isDragActive && 'border-primary bg-primary/10 scale-105',
        isDragReject && 'border-red-500 bg-red-50 dark:bg-red-900/10',
        uploadStatus === 'error' && 'border-red-500 bg-red-50 dark:bg-red-900/10',
        uploadStatus === 'success' && 'border-green-500 bg-green-50 dark:bg-green-900/10',
        uploadStatus === 'loading' && 'border-blue-500 bg-blue-50 dark:bg-blue-900/10',
        className
      )}
    >
      <input {...getInputProps()} />
      
      {/* Icon */}
      <div className="mb-4">
        {getStatusIcon()}
      </div>
      
      {/* Main Message */}
      <h3 className={cn('text-xl font-semibold mb-2', getStatusColor())}>
        {getStatusMessage()}
      </h3>
      
      {/* Details */}
      {uploadStatus === 'idle' && (
        <div className="space-y-2">
          <p className="text-muted-foreground">
            Supports .mpif files up to 10MB
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <File className="h-4 w-4" />
            <span>MPIF (Material Preparation Information File)</span>
          </div>
        </div>
      )}
      
      {/* Error Action */}
      {uploadStatus === 'error' && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
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
  );
}

export default FileUpload; 