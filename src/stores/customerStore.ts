import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/lib/api-client';
import { Customer } from '@shared/types';
import { toast } from 'sonner';
type CustomerState = {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
};
type CustomerActions = {
  fetchCustomers: () => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<Customer | undefined>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<Customer | undefined>;
  deleteCustomer: (id: string) => Promise<void>;
};
export const useCustomerStore = create<CustomerState & CustomerActions>()(
  immer((set) => ({
    customers: [],
    isLoading: false,
    error: null,
    fetchCustomers: async () => {
      set({ isLoading: true, error: null });
      try {
        const data = await api<{ items: Customer[] }>('/api/customers');
        set((state) => {
          state.customers = data.items;
          state.isLoading = false;
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch customers';
        set({ isLoading: false, error: errorMessage });
        toast.error(errorMessage);
      }
    },
    addCustomer: async (customerData) => {
      set({ isLoading: true });
      try {
        const newCustomer = await api<Customer>('/api/customers', {
          method: 'POST',
          body: JSON.stringify(customerData),
        });
        set((state) => {
          state.customers.push(newCustomer);
          state.isLoading = false;
        });
        toast.success('Customer added successfully!');
        return newCustomer;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to add customer';
        set({ isLoading: false, error: errorMessage });
        toast.error(errorMessage);
        return undefined;
      }
    },
    updateCustomer: async (id, customerUpdate) => {
      set({ isLoading: true });
      try {
        const updatedCustomer = await api<Customer>(`/api/customers/${id}`, {
          method: 'PUT',
          body: JSON.stringify(customerUpdate),
        });
        set((state) => {
          const index = state.customers.findIndex((c) => c.id === id);
          if (index !== -1) {
            state.customers[index] = updatedCustomer;
          }
          state.isLoading = false;
        });
        toast.success('Customer updated successfully!');
        return updatedCustomer;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update customer';
        set({ isLoading: false, error: errorMessage });
        toast.error(errorMessage);
        return undefined;
      }
    },
    deleteCustomer: async (id: string) => {
      set({ isLoading: true });
      try {
        await api(`/api/customers/${id}`, { method: 'DELETE' });
        set((state) => {
          state.customers = state.customers.filter((c) => c.id !== id);
          state.isLoading = false;
        });
        toast.success('Customer deleted successfully!');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete customer';
        set({ isLoading: false, error: errorMessage });
        toast.error(errorMessage);
      }
    },
  }))
);