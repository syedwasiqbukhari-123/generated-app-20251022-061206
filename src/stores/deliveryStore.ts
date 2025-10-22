import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/lib/api-client';
import { Order } from '@shared/types';
import { toast } from 'sonner';
import { OrderWithDetails } from './orderStore';
type DeliveryState = {
  deliveries: OrderWithDetails[];
  isLoading: boolean;
  error: string | null;
};
type DeliveryActions = {
  fetchDeliveries: () => Promise<void>;
  updateDeliveryStatus: (id: string, status: Order['status']) => Promise<void>;
  updatePaymentStatus: (id: string, paymentStatus: Order['paymentStatus']) => Promise<void>;
};
export const useDeliveryStore = create<DeliveryState & DeliveryActions>()(
  immer((set) => ({
    deliveries: [],
    isLoading: false,
    error: null,
    fetchDeliveries: async () => {
      set({ isLoading: true, error: null });
      try {
        const data = await api<{ items: OrderWithDetails[] }>('/api/deliveries');
        set((state) => {
          state.deliveries = data.items;
          state.isLoading = false;
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch deliveries';
        set({ isLoading: false, error: errorMessage });
        toast.error(errorMessage);
      }
    },
    updateDeliveryStatus: async (id, status) => {
      set((state) => {
        const delivery = state.deliveries.find((d) => d.id === id);
        if (delivery) delivery.status = status;
      });
      try {
        await api(`/api/orders/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ status }),
        });
        toast.success(`Delivery marked as ${status.toLowerCase()}`);
      } catch (error) {
        toast.error('Failed to update delivery status.');
        // Revert state on failure
        set((state) => {
            // This requires fetching the original state, which is complex.
            // A full refetch might be simpler here.
        });
      }
    },
    updatePaymentStatus: async (id, paymentStatus) => {
        set((state) => {
            const delivery = state.deliveries.find((d) => d.id === id);
            if (delivery) delivery.paymentStatus = paymentStatus;
        });
        try {
            await api(`/api/orders/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ paymentStatus }),
            });
            toast.success(`Payment marked as ${paymentStatus.toLowerCase()}`);
        } catch (error) {
            toast.error('Failed to update payment status.');
        }
    }
  }))
);