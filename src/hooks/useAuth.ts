import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Role } from '@shared/types';
interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    role: Role;
  } | null;
  login: (id: string, name: string, role: Role) => void;
  logout: () => void;
}
export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: (id, name, role) => set({ isAuthenticated: true, user: { id, name, role } }),
      logout: () => set({ isAuthenticated: false, user: null }),
    }),
    {
      name: 'aquaflow-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);