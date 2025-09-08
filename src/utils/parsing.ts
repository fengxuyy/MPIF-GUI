import { PXRDData, TGAData } from '@/types/mpif';

export const parsePXRDData = (text: string): PXRDData['data'] => {
  try {
    const lines = text.trim().split('\n');
    const data: PXRDData['data'] = [];
    
    for (const line of lines) {
      if (line.trim() === '') continue;
      const [twoTheta, intensity] = line.split(/[\t,\s]+/).map(Number);
      if (!isNaN(twoTheta) && !isNaN(intensity)) {
        data.push({ twoTheta, intensity });
      }
    }
    
    return data;
  } catch {
    return [];
  }
};

export const parseTGAData = (text: string): TGAData['data'] => {
  try {
    const lines = text.trim().split('\n');
    const data: TGAData['data'] = [];
    
    for (const line of lines) {
      if (line.trim() === '') continue;
      const [temperature, weightPercent] = line.split(/[\t,\s]+/).map(Number);
      if (!isNaN(temperature) && !isNaN(weightPercent)) {
        data.push({ temperature, weightPercent });
      }
    }
    
    return data;
  } catch {
    return [];
  }
};
