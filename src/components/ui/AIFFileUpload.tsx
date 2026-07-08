import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Upload, File, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface AIFFileUploadProps {
  onFileLoad?: (content: string, filename: string) => void;
  className?: string;
  currentFileName?: string;
}

export function AIFFileUpload({ onFileLoad, className, currentFileName }: AIFFileUploadProps) {
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
    if (!file.name.toLowerCase().endsWith('.aif')) {
      setUploadStatus('error');
      setErrorMessage('Please upload a .aif file');
      return;
    }

    setUploadStatus('loading');
    setErrorMessage('');

    try {
      const content = await file.text();
      
      // Basic validation - check if it looks like an AIF/CIF-like format
      if (!content.trim()) {
        throw new Error('File appears to be empty');
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
      'text/plain': ['.aif'],
      'application/octet-stream': ['.aif']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB limit
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
        return <Upload className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const getStatusMessage = () => {
    switch (uploadStatus) {
      case 'loading':
        return 'Processing file...';
      case 'success':
        return 'File uploaded successfully!';
      case 'error':
        return errorMessage || 'Upload failed';
      default:
        if (fileName) {
          return `Current file: ${fileName}`;
        }
        return isDragActive ? 'Drop your AIF file here' : 'Upload AIF file';
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
            Supports .aif files up to 5MB
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <File className="h-3 w-3" />
            <span>Adsorption Information Format</span>
          </div>
        </div>
      )}

      {uploadStatus === 'idle' && fileName && (
        <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
          This AIF will be embedded in the exported MPIF.
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

export default AIFFileUpload;
