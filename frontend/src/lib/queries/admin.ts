import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface AdminStats {
  total_salons: number;
  total_stylists: number;
  total_customers: number;
  monthly_sessions: number;
  completed_sessions: number;
  new_clients_this_month: number;
  new_clients_last_month: number;
}

export interface AdminSalon {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  subscription_tier: string;
  ai_credits_remaining: number;
  created_at: string;
  user_count: number;
  session_count: number;
  completed_sessions: number;
  status: 'active' | 'pending' | 'suspended';
}

export interface AdminActivity {
  type: string;
  title: string;
  desc: string;
  time: string;
}

export interface DailySession {
  date: string;
  day: string;
  total: number;
  completed: number;
}

export interface PopularStyle {
  style_name: string;
  count: number;
  pct: number;
}

export interface AdminAnalytics {
  daily_sessions: DailySession[];
  popular_styles: PopularStyle[];
  tier_breakdown: { tier: string; count: number }[];
}

export interface CreateSalonPayload {
  name: string;
  email: string;
  phone: string;
  address: string;
  subscription_tier?: string;
  ai_credits?: number;
  admin_email: string;
  admin_name: string;
  admin_password: string;
}

export interface UpdateSalonPayload {
  name?: string;
  phone?: string;
  address?: string;
  subscription_tier?: string;
  ai_credits_remaining?: number;
  is_active?: boolean;
}

export const adminKeys = {
  stats: ['admin', 'stats'] as const,
  salons: ['admin', 'salons'] as const,
  analytics: ['admin', 'analytics'] as const,
  activities: ['admin', 'activities'] as const,
};

export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats,
    queryFn: async () => {
      const { data } = await apiClient.get<AdminStats>('/admin/stats');
      return data;
    },
  });
}

export function useAdminSalons() {
  return useQuery({
    queryKey: adminKeys.salons,
    queryFn: async () => {
      const { data } = await apiClient.get<AdminSalon[]>('/admin/salons');
      return data;
    },
  });
}

export function useAdminAnalytics() {
  return useQuery({
    queryKey: adminKeys.analytics,
    queryFn: async () => {
      const { data } = await apiClient.get<AdminAnalytics>('/admin/analytics');
      return data;
    },
  });
}

export function useAdminActivities() {
  return useQuery({
    queryKey: adminKeys.activities,
    queryFn: async () => {
      const { data } = await apiClient.get<AdminActivity[]>('/admin/activities');
      return data;
    },
  });
}

export function useCreateSalon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateSalonPayload) => {
      const { data } = await apiClient.post('/admin/salons', payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.salons }),
  });
}

export function useUpdateSalon(salonId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateSalonPayload) => {
      const { data } = await apiClient.patch(`/admin/salons/${salonId}`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.salons }),
  });
}

export function useDeleteSalon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (salonId: string) => {
      await apiClient.delete(`/admin/salons/${salonId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.salons }),
  });
}
