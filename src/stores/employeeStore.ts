import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/lib/api-client';
import { Employee } from '@shared/types';
import { toast } from 'sonner';
type EmployeeState = {
  employees: Employee[];
  isLoading: boolean;
  error: string | null;
};
type EmployeeActions = {
  fetchEmployees: () => Promise<void>;
  addEmployee: (employee: Omit<Employee, 'id' | 'joinDate' | 'status'>) => Promise<Employee | undefined>;
  updateEmployee: (id: string, employee: Partial<Omit<Employee, 'id'>>) => Promise<Employee | undefined>;
  deleteEmployee: (id: string) => Promise<void>;
};
export const useEmployeeStore = create<EmployeeState & EmployeeActions>()(
  immer((set) => ({
    employees: [],
    isLoading: false,
    error: null,
    fetchEmployees: async () => {
      set({ isLoading: true, error: null });
      try {
        const data = await api<{ items: Employee[] }>('/api/employees');
        set((state) => {
          state.employees = data.items;
          state.isLoading = false;
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch employees';
        set({ isLoading: false, error: errorMessage });
        toast.error(errorMessage);
      }
    },
    addEmployee: async (employeeData) => {
      set({ isLoading: true });
      try {
        const newEmployee = await api<Employee>('/api/employees', {
          method: 'POST',
          body: JSON.stringify(employeeData),
        });
        set((state) => {
          state.employees.push(newEmployee);
          state.isLoading = false;
        });
        toast.success('Employee added successfully!');
        return newEmployee;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to add employee';
        set({ isLoading: false, error: errorMessage });
        toast.error(errorMessage);
        return undefined;
      }
    },
    updateEmployee: async (id, employeeUpdate) => {
      set({ isLoading: true });
      try {
        const updatedEmployee = await api<Employee>(`/api/employees/${id}`, {
          method: 'PUT',
          body: JSON.stringify(employeeUpdate),
        });
        set((state) => {
          const index = state.employees.findIndex((e) => e.id === id);
          if (index !== -1) {
            state.employees[index] = updatedEmployee;
          }
          state.isLoading = false;
        });
        toast.success('Employee updated successfully!');
        return updatedEmployee;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update employee';
        set({ isLoading: false, error: errorMessage });
        toast.error(errorMessage);
        return undefined;
      }
    },
    deleteEmployee: async (id: string) => {
      set({ isLoading: true });
      try {
        await api(`/api/employees/${id}`, { method: 'DELETE' });
        set((state) => {
          state.employees = state.employees.filter((e) => e.id !== id);
          state.isLoading = false;
        });
        toast.success('Employee deleted successfully!');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete employee';
        set({ isLoading: false, error: errorMessage });
        toast.error(errorMessage);
      }
    },
  }))
);