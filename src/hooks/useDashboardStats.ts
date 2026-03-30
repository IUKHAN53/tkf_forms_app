import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../api/dashboard';

export function useDashboardStats() {
  const { data: stats, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  return {
    stats: stats ?? null,
    loading,
    error: error?.message ?? null,
    refetch,
  };
}
