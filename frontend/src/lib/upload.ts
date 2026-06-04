import axios from 'axios';
import { apiClient } from '@/lib/api';

export async function uploadPhoto(file: File, folder = 'photos'): Promise<string> {
  const { data } = await apiClient.post<{
    upload_url: string;
    key: string;
    public_url: string;
    _mock?: string;
  }>('/uploads/presign', { content_type: file.type || 'image/jpeg', folder });

  if (data._mock === 'true' || !data.upload_url) {
    // S3 not configured — return data URL so the session can proceed in dev
    return await fileToDataUrl(file);
  }

  await axios.put(data.upload_url, file, {
    headers: { 'Content-Type': file.type || 'image/jpeg' },
  });

  return data.public_url;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function dataUrlToFile(dataUrl: string, filename = 'photo.jpg'): File {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new File([arr], filename, { type: mime });
}
