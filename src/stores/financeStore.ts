import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/lib/api-client';
import { Transaction } from '@shared/types';
import { toast } from 'sonner';
type FinanceSummary = {
  revenue: number;
  expenses: number;
  netProfit: number;
  outstandingPayments: number;
};
type FinanceState = {
  summary: FinanceSummary | null;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
};
type FinanceActions = {
  fetchFinanceData: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<Transaction | undefined>;
  updateTransaction: (id: string, transaction: Partial<Omit<Transaction, 'id'>>) => Promise<Transaction | undefined>;
  deleteTransaction: (id: string) => Promise<void>;
};
export const useFinanceStore = create<FinanceState & FinanceActions>()(
  immer((set, get) => ({
    summary: null,
    transactions: [],
    isLoading: false,
    error: null,
    fetchFinanceData: async () => {
      set({ isLoading: true, error: null });
      try {
        const data = await api<{ summary: FinanceSummary; transactions: Transaction[] }>('/api/finance');
        set((state) => {
          state.summary = data.summary;
          state.transactions = data.transactions;
          state.isLoading = false;
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch finance data';
        set({ isLoading: false, error: errorMessage });
        toast.error(errorMessage);
      }
    },
    addTransaction: async (transactionData) => {
      set({ isLoading: true });
      try {
        const newTransaction = await api<Transaction>('/api/transactions', {
          method: 'POST',
          body: JSON.stringify(transactionData),
        });
        toast.success('Transaction added successfully!');
        await get().fetchFinanceData(); // Refetch all data to update summary
        return newTransaction;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to add transaction';
        set({ isLoading: false, error: errorMessage });
        toast.error(errorMessage);
        return undefined;
      }
    },
    updateTransaction: async (id, transactionUpdate) => {
      set({ isLoading: true });
      try {
        const updatedTransaction = await api<Transaction>(`/api/transactions/${id}`, {
          method: 'PUT',
          body: JSON.stringify(transactionUpdate),
        });
        toast.success('Transaction updated successfully!');
        await get().fetchFinanceData(); // Refetch all data to update summary
        return updatedTransaction;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update transaction';
        set({ isLoading: false, error: errorMessage });
        toast.error(errorMessage);
        return undefined;
      }
    },
    deleteTransaction: async (id: string) => {
      set({ isLoading: true });
      try {
        await api(`/api/transactions/${id}`, { method: 'DELETE' });
        toast.success('Transaction deleted successfully!');
        await get().fetchFinanceData(); // Refetch all data to update summary
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete transaction';
        set({ isLoading: false, error: errorMessage });
        toast.error(errorMessage);
      }
    },
  }))
);