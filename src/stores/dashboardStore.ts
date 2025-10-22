import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Order, Customer } from '@shared/types';
export interface KpiData {
  bottlesInStock: number;
  ordersToday: number;
  totalCustomers: number;
  pendingPayments: number;
  deliveriesToday: number;
}
export interface SalesData {
  name: string;
  sales: number;
  revenue: number;
}
export type RecentActivity = (Order | Customer) & { type: 'order' | 'customer'; timestamp: string };
export interface DashboardData {
  kpis: KpiData;
  salesData: SalesData[];
  recentActivity: RecentActivity[];
}
type DashboardState = {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
};
type DashboardActions = {
  fetchDashboardData: () => Promise<void>;
};
export const useDashboardStore = create<DashboardState & DashboardActions>()(
  immer((set) => ({
    data: null,
    isLoading: false,
    error: null,
    fetchDashboardData: async () => {
      set({ isLoading: true, error: null });
      try {
        const dashboardData = await api<DashboardData>('/api/dashboard');
        set((state) => {
          state.data = dashboardData;
          state.isLoading = false;
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard data';
        set({ isLoading: false, error: errorMessage });
        toast.error(errorMessage);
      }
    },
  }))
);