import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface Hairstyle {
  id: string;
  session_id: string;
  preview_url: string;
  style_name: string;
  style_tags: string[];
  ai_metadata: Record<string, unknown>;
  is_selected: boolean;
  created_at: string;
}

export interface Session {
  id: string;
  salon_id: string;
  barber_id: string;
  customer_id: string | null;
  original_photo_url: string;
  face_analysis: FaceAnalysis | null;
  status: 'in_progress' | 'completed' | 'abandoned';
  selected_hairstyle_id: string | null;
  final_result_photo_url: string | null;
  hairstyles: Hairstyle[];
  created_at: string;
  updated_at: string;
}

export interface FaceAnalysis {
  face_shape: string;
  hair_texture: string;
  hair_length: string;
  hair_color: string;
  age_group: string;
  recommended_styles: string[];
}

export const sessionKeys = {
  all: ['sessions'] as const,
  detail: (id: string) => ['sessions', id] as const,
  hairstyles: (id: string) => ['sessions', id, 'hairstyles'] as const,
};

export function useSession(id: string) {
  return useQuery({
    queryKey: sessionKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<Session>(`/sessions/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useSessionHairstyles(sessionId: string) {
  return useQuery({
    queryKey: sessionKeys.hairstyles(sessionId),
    queryFn: async () => {
      const { data } = await apiClient.get<Hairstyle[]>(`/sessions/${sessionId}/hairstyles`);
      return data;
    },
    enabled: !!sessionId,
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { original_photo_url: string; customer_id?: string }) => {
      const { data } = await apiClient.post<Session>('/sessions', payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.all }),
  });
}

export function useAnalyzeFace(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<FaceAnalysis>(`/sessions/${sessionId}/analyze-face`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.detail(sessionId) }),
  });
}

export function useGenerateHairstyles(sessionId: string) {
  return useMutation({
    mutationFn: async (gender: 'male' | 'female' = 'female') => {
      const { data } = await apiClient.post<{ status: string; count: number }>(
        `/sessions/${sessionId}/generate-hairstyles?gender=${gender}`
      );
      return data;
    },
  });
}

export function useValidatePhoto() {
  return useMutation({
    mutationFn: async (photo_url: string) => {
      const { data } = await apiClient.post<{ valid: boolean; reason: string }>(
        '/sessions/validate-photo',
        { photo_url }
      );
      return data;
    },
  });
}

export function useSelectHairstyle(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (hairstyleId: string) => {
      const { data } = await apiClient.post<Session>(
        `/sessions/${sessionId}/select-hairstyle/${hairstyleId}`
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.detail(sessionId) }),
  });
}

export function useCompleteSession(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { final_result_photo_url?: string }) => {
      const { data } = await apiClient.patch<Session>(`/sessions/${sessionId}`, {
        status: 'completed',
        ...payload,
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.detail(sessionId) }),
  });
}

export function useUploadFinalPhoto(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (photo_url: string) => {
      const { data } = await apiClient.post<Session>(`/sessions/${sessionId}/final-photo`, { photo_url });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.detail(sessionId) }),
  });
}
