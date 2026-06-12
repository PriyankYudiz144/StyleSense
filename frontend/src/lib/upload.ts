import { apiClient } from '@/lib/api';

export async function uploadPhoto(file: File, folder = 'photos'): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await apiClient.post<{ url: string }>(
    `/uploads/file?folder=${folder}`,
    form,
    { headers: { 'Content-Type': undefined } },
  );
  return data.url;
}

export function dataUrlToFile(dataUrl: string, filename = 'photo.jpg'): File {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new File([arr], filename, { type: mime });
}
