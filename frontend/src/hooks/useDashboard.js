import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService.js';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardService.getStats,
    staleTime: 60_000,
  });
}

export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: dashboardService.getHealth,
    retry: false,
    staleTime: 30_000,
  });
}
