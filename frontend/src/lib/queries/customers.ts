import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface Customer {
  id: string;
  salon_id: string;
  full_name: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomersPage {
  items: Customer[];
  total: number;
  page: number;
  per_page: number;
}

export const customerKeys = {
  all: ['customers'] as const,
  list: (page: number, search?: string) => ['customers', 'list', page, search] as const,
  detail: (id: string) => ['customers', id] as const,
};

export function useCustomers(page = 1, search?: string) {
  return useQuery({
    queryKey: customerKeys.list(page, search),
    queryFn: async () => {
      const params: Record<string, string | number> = { page, per_page: 20 };
      if (search) params.search = search;
      const { data } = await apiClient.get<CustomersPage>('/customers', { params });
      return data;
    },
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<Customer>(`/customers/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { full_name?: string; phone?: string; notes?: string }) => {
      const { data } = await apiClient.post<Customer>('/customers', payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: customerKeys.all }),
  });
}
