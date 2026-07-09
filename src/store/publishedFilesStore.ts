import { MPIFData } from '@/types/mpif';
import { OrcidUser } from '@/store/authStore';

export interface PublishedFileRecord {
  id: string;
  fileName: string;
  format: 'mpif' | 'json';
  content: string;
  mpifData: MPIFData;
  author: {
    orcid: string;
    name: string;
    email: string;
  };
  savedAt: string;
  /** DOI-style identifier assigned by the server at publish time, e.g. "mpif.2026.4f9a1c2b". */
  doi: string;
}

export const savePublishedFile = async (params: {
  fileName: string;
  format: 'mpif' | 'json';
  content: string;
  mpifData: MPIFData;
  author: OrcidUser;
}): Promise<PublishedFileRecord> => {
  const response = await fetch('/api/published-files', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileName: params.fileName,
      format: params.format,
      content: params.content,
      mpifData: params.mpifData,
      author: {
        orcid: params.author.orcid,
        name: params.author.name,
        email: params.author.email,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to save published file: ${response.status}`);
  }

  return response.json();
};

export const getPublishedFiles = async (): Promise<PublishedFileRecord[]> => {
  const response = await fetch('/api/published-files');

  if (!response.ok) {
    throw new Error(`Failed to load published files: ${response.status}`);
  }

  return response.json();
};

export const deletePublishedFile = async (recordId: string, authorOrcid: string): Promise<void> => {
  const response = await fetch(`/api/published-files/${encodeURIComponent(recordId)}`, {
    method: 'DELETE',
    headers: {
      'X-ORCID-ID': authorOrcid,
    },
  });

  if (!response.ok) {
    let detail = '';
    try {
      const payload = await response.json();
      detail = payload.detail ? `: ${payload.detail}` : '';
    } catch {
      detail = '';
    }

    throw new Error(`Failed to delete published file: ${response.status}${detail}`);
  }
};
