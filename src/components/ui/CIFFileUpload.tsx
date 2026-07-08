import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Loader2, Atom } from 'lucide-react';

interface CIFFileUploadProps {
  onFileLoad?: (content: string, filename: string) => void;
  className?: string;
  currentFileName?: string;
}

export function CIFFileUpload({ onFileLoad, className, currentFileName }: CIFFileUploadProps) {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [fileName, setFileName] = useState<string>(currentFileName || '');

  useEffect(() => {
    setFileName(currentFileName || '');
  }, [currentFileName]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file extension
    if (!file.name.toLowerCase().endsWith('.cif')) {
      setUploadStatus('error');
      setErrorMessage('Please upload a .cif file');
      return;
    }

    setUploadStatus('loading');
    setErrorMessage('');

    try {
      const content = await file.text();
      
      // Basic validation - check if it looks like a CIF format
      if (!content.trim()) {
        throw new Error('File appears to be empty');
      }

      // Basic CIF structure validation
      if (!content.includes('data_') && !content.includes('_cell_length')) {
        setUploadStatus('error');
        setErrorMessage('File does not appear to be a valid CIF file');
        return;
      }

      setUploadStatus('success');
      setFileName(file.name);
      
      // Call the callback
      if (onFileLoad) {
        onFileLoad(content, file.name);
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
      'text/plain': ['.cif'],
      'application/octet-stream': ['.cif'],
      'chemical/x-cif': ['.cif']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB limit
  });

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-purple-500 dark:text-purple-400" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        if (fileName) {
          return <CheckCircle className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />;
        }
        return <Atom className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const getStatusMessage = () => {
    switch (uploadStatus) {
      case 'loading':
        return 'Processing CIF file...';
      case 'success':
        return 'CIF file uploaded successfully!';
      case 'error':
        return errorMessage || 'Upload failed';
      default:
        if (fileName) {
          return `Current file: ${fileName}`;
        }
        return isDragActive ? 'Drop your CIF file here' : 'Upload CIF file';
    }
  };

  const getStatusColor = () => {
    switch (uploadStatus) {
      case 'loading':
        return 'text-purple-500 dark:text-purple-400';
      case 'success':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return fileName ? 'text-foreground' : 'text-muted-foreground';
    }
  };

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200',
        'hover:border-primary/60 hover:bg-primary/5',
        isDragActive && 'border-primary bg-primary/10 scale-105',
        isDragReject && 'border-red-500 bg-red-50 dark:bg-red-900/10',
        uploadStatus === 'error' && 'border-red-500 bg-red-50 dark:bg-red-900/10',
        uploadStatus === 'success' && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20',
        uploadStatus === 'loading' && 'border-purple-500 bg-purple-50 dark:bg-purple-950/20',
        className
      )}
    >
      <input {...getInputProps()} />
      
      {/* Icon */}
      <div className="mb-3">
        {getStatusIcon()}
      </div>
      
      {/* Main Message */}
      <h4 className={cn('text-lg font-medium mb-2', getStatusColor())}>
        {getStatusMessage()}
      </h4>
      
      {/* Details */}
      {uploadStatus === 'idle' && !fileName && (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Supports .cif files up to 10MB
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Atom className="h-3 w-3" />
            <span>Crystallographic Information File</span>
          </div>
        </div>
      )}

      {uploadStatus === 'idle' && fileName && (
        <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
          This CIF will be embedded in the exported MPIF.
        </p>
      )}
      
      {/* Error Action */}
      {uploadStatus === 'error' && (
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={(e) => {
            e.stopPropagation();
            setUploadStatus('idle');
            setErrorMessage('');
          }}
        >
          Try Again
        </Button>
      )}

      {/* Clear file action when file is loaded */}
      {fileName && uploadStatus === 'idle' && (
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={(e) => {
            e.stopPropagation();
            setFileName('');
            if (onFileLoad) {
              onFileLoad('', '');
            }
          }}
        >
          Clear File
        </Button>
      )}
    </div>
  );
}

export default CIFFileUpload;
