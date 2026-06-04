import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface TeamMember {
  id: string;
  salon_id: string | null;
  email: string;
  full_name: string;
  role: 'super_admin' | 'salon_admin' | 'barber';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const userKeys = {
  all: ['users'] as const,
  list: () => ['users', 'list'] as const,
};

export function useTeamMembers() {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: async () => {
      const { data } = await apiClient.get<TeamMember[]>('/users');
      return data;
    },
  });
}

export function useInviteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { full_name: string; email: string; role: string }) => {
      const { data } = await apiClient.post<{ user: TeamMember; temp_password: string }>(
        '/users/invite',
        payload
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; role?: string; is_active?: boolean }) => {
      const { data } = await apiClient.patch<TeamMember>(`/users/${id}`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useRemoveUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/users/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}
