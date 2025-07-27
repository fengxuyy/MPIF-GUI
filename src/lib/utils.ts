import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function downloadFile(content: string, filename: string, contentType = 'text/plain') {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function generateMPIFFileName(commonName: string, authorName: string, date?: string): string {
  const cleanName = commonName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
  const cleanAuthor = authorName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
  const dateStr = date ? date.replace(/-/g, '') : new Date().toISOString().split('T')[0].replace(/-/g, '');
  
  return `${cleanName}_${dateStr}_${cleanAuthor}.mpif`;
} 