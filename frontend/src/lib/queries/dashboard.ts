import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface DashboardStats {
  total_customers: number;
  total_sessions: number;
  completed_sessions: number;
  ai_credits_remaining: number;
}

export interface RecentSession {
  id: string;
  status: string;
  customer_name: string;
  barber_name: string;
  original_photo_url: string;
  created_at: string;
}

export interface PopularStyle {
  style_name: string;
  count: number;
  pct: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardStats>('/dashboard/stats');
      return data;
    },
    staleTime: 30_000,
  });
}

export function useRecentSessions() {
  return useQuery({
    queryKey: ['dashboard', 'recent-sessions'],
    queryFn: async () => {
      const { data } = await apiClient.get<RecentSession[]>('/dashboard/recent-sessions');
      return data;
    },
    staleTime: 15_000,
  });
}

export function usePopularStyles() {
  return useQuery({
    queryKey: ['dashboard', 'popular-styles'],
    queryFn: async () => {
      const { data } = await apiClient.get<PopularStyle[]>('/dashboard/popular-styles');
      return data;
    },
    staleTime: 60_000,
  });
}
