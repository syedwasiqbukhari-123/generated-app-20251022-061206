import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/lib/api-client';
import { Order } from '@shared/types';
import { toast } from 'sonner';
export type OrderWithDetails = Order & {
  customerName?: string;
  totalItems?: number;
};
type OrderState = {
  orders: OrderWithDetails[];
  isLoading: boolean;
  error: string | null;
};
type OrderActions = {
  fetchOrders: () => Promise<void>;
  addOrder: (order: Omit<Order, 'id'>) => Promise<Order | undefined>;
  updateOrder: (id: string, order: Partial<Omit<Order, 'id'>>) => Promise<Order | undefined>;
  deleteOrder: (id: string) => Promise<void>;
};
export const useOrderStore = create<OrderState & OrderActions>()(
  immer((set) => ({
    orders: [],
    isLoading: false,
    error: null,
    fetchOrders: async () => {
      set({ isLoading: true, error: null });
      try {
        const data = await api<{ items: OrderWithDetails[] }>('/api/orders');
        set((state) => {
          state.orders = data.items;
          state.isLoading = false;
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orders';
        set({ isLoading: false, error: errorMessage });
        toast.error(errorMessage);
      }
    },
    addOrder: async (orderData) => {
      set({ isLoading: true });
      try {
        const newOrder = await api<Order>('/api/orders', {
          method: 'POST',
          body: JSON.stringify(orderData),
        });
        // Refetching is better to get fully populated data from the server
        // This is handled in the component after submit
        toast.success('Order created successfully!');
        return newOrder;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
        set({ isLoading: false, error: errorMessage });
        toast.error(errorMessage);
        return undefined;
      }
    },
    updateOrder: async (id, orderUpdate) => {
      set({ isLoading: true });
      try {
        const updatedOrder = await api<Order>(`/api/orders/${id}`, {
          method: 'PUT',
          body: JSON.stringify(orderUpdate),
        });
        // Refetching is better to get fully populated data from the server
        // This is handled in the component after submit
        toast.success('Order updated successfully!');
        return updatedOrder;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update order';
        set({ isLoading: false, error: errorMessage });
        toast.error(errorMessage);
        return undefined;
      }
    },
    deleteOrder: async (id: string) => {
      set({ isLoading: true });
      try {
        await api(`/api/orders/${id}`, { method: 'DELETE' });
        set((state) => {
          state.orders = state.orders.filter((o) => o.id !== id);
          state.isLoading = false;
        });
        toast.success('Order deleted successfully!');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete order';
        set({ isLoading: false, error: errorMessage });
        toast.error(errorMessage);
      }
    },
  }))
);