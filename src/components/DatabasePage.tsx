import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Database,
  Download,
  FileText,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { deletePublishedFile, getPublishedFiles, PublishedFileRecord } from '@/store/publishedFilesStore';

const formatSavedDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatByteSize = (content: string) => {
  const bytes = new Blob([content]).size;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const downloadRecord = (record: PublishedFileRecord) => {
  const type = record.format === 'json' ? 'application/json' : 'text/plain';
  const blob = new Blob([record.content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = record.fileName || `published-file.${record.format}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export default function DatabasePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [records, setRecords] = useState<PublishedFileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      const savedFiles = await getPublishedFiles();
      setRecords(savedFiles);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? `${error.message}. Please make sure the backend is running with npm run dev:ngrok or npm run dev:api.`
          : 'Failed to load the published database. Please make sure the backend API is running.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDeleteRecord = async (record: PublishedFileRecord) => {
    if (!user || user.orcid !== record.author.orcid) return;

    const confirmed = window.confirm(
      `Delete ${record.fileName} from the published database? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingRecordId(record.id);
    setErrorMessage('');
    setStatusMessage('');

    try {
      await deletePublishedFile(record.id, user.orcid);
      setRecords((currentRecords) => currentRecords.filter((item) => item.id !== record.id));
      setStatusMessage(`${record.fileName} was deleted from the published database.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete the published file.');
    } finally {
      setDeletingRecordId(null);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 relative overflow-hidden">
      <div className="absolute inset-0 intro-dot-grid pointer-events-none opacity-30" />
      <div className="absolute top-0 right-0 w-[520px] h-[520px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-purple-500/10 rounded-full blur-[130px] pointer-events-none" />

      <header className="relative z-10 border-b border-zinc-200/80 dark:border-zinc-900/80 bg-white/75 dark:bg-zinc-950/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition-all hover:border-purple-300 hover:text-purple-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-purple-700 dark:hover:text-purple-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Home
          </button>

          <div className="hidden sm:flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-200 bg-purple-100 text-purple-700 dark:border-purple-800/70 dark:bg-purple-950/70 dark:text-purple-300">
              <Database className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-geist text-sm font-bold tracking-tight text-zinc-950 dark:text-white">Published MPIF Database</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Files marked publishable after export</p>
            </div>
          </div>

          <Button onClick={loadRecords} variant="secondary" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-8 sm:py-10">
        <section className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-purple-200/70 bg-white/80 p-5 shadow-sm shadow-purple-500/10 backdrop-blur-xl dark:border-purple-900/60 dark:bg-zinc-900/70 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800 dark:border-purple-800/70 dark:bg-purple-950/70 dark:text-purple-300">
              <FileText className="h-3.5 w-3.5" />
              Backend SQLite archive
            </div>
            <h2 className="font-geist text-2xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
              Database records
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Browse files that researchers confirmed as publishable during export. Use download to retrieve the stored MPIF or JSON content.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left dark:border-zinc-800 dark:bg-zinc-950/80 sm:text-right">
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{records.length}</div>
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Saved file{records.length === 1 ? '' : 's'}</div>
          </div>
        </section>

        {errorMessage && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {statusMessage && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300">
            {statusMessage}
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white/85 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/75">
          {isLoading ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-zinc-500 dark:text-zinc-400">
              <RefreshCw className="h-6 w-6 animate-spin text-purple-500" />
              <span className="text-sm font-medium">Loading published files...</span>
            </div>
          ) : records.length === 0 && !errorMessage ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-purple-200 bg-purple-100 text-purple-700 dark:border-purple-800/70 dark:bg-purple-950/70 dark:text-purple-300">
                <Database className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-zinc-950 dark:text-white">No published files yet</h3>
              <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
                Export a file from the dashboard, mark it as publishable, and it will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50/90 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-400">
                  <tr>
                    <th className="px-5 py-3 font-semibold">File</th>
                    <th className="px-5 py-3 font-semibold">Author</th>
                    <th className="px-5 py-3 font-semibold">ORCID</th>
                    <th className="px-5 py-3 font-semibold">Saved</th>
                    <th className="px-5 py-3 font-semibold">Size</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {records.map((record) => (
                    <tr key={record.id} className="transition-colors hover:bg-purple-50/60 dark:hover:bg-purple-950/20">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-purple-200 bg-purple-100 text-purple-700 dark:border-purple-800/70 dark:bg-purple-950/70 dark:text-purple-300">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-zinc-950 dark:text-white">{record.fileName}</div>
                            <div className="mt-0.5 text-xs uppercase text-zinc-500 dark:text-zinc-400">{record.format}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-zinc-700 dark:text-zinc-300">{record.author.name || 'Unknown'}</td>
                      <td className="px-5 py-4 font-mono text-xs text-zinc-500 dark:text-zinc-400">{record.author.orcid || 'Not provided'}</td>
                      <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">{formatSavedDate(record.savedAt)}</td>
                      <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">{formatByteSize(record.content)}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button onClick={() => downloadRecord(record)} size="sm">
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </Button>
                          {user?.orcid === record.author.orcid && (
                            <Button
                              onClick={() => handleDeleteRecord(record)}
                              variant="destructive"
                              size="sm"
                              disabled={deletingRecordId === record.id}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {deletingRecordId === record.id ? 'Deleting...' : 'Delete'}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
