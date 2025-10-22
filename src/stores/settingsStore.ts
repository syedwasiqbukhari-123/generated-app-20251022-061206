import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/lib/api-client';
import { Setting } from '@shared/types';
import { toast } from 'sonner';
type SettingsState = {
  logoUrl: string | null;
  isLoading: boolean;
  error: string | null;
};
type SettingsActions = {
  fetchLogoUrl: () => Promise<void>;
  updateLogoUrl: (url: string) => Promise<void>;
};
export const useSettingsStore = create<SettingsState & SettingsActions>()(
  immer((set) => ({
    logoUrl: null,
    isLoading: false,
    error: null,
    fetchLogoUrl: async () => {
      set({ isLoading: true, error: null });
      try {
        const setting = await api<Setting>('/api/settings/logoUrl');
        set((state) => {
          state.logoUrl = setting.value || null;
          state.isLoading = false;
        });
      } catch (error) {
        // It's okay if it fails, it just means no logo is set. Don't show an error toast.
        set((state) => {
          state.logoUrl = null;
          state.isLoading = false;
        });
      }
    },
    updateLogoUrl: async (url: string) => {
      set({ isLoading: true });
      try {
        const updatedSetting = await api<Setting>('/api/settings/logoUrl', {
          method: 'PUT',
          body: JSON.stringify({ value: url }),
        });
        set((state) => {
          state.logoUrl = updatedSetting.value;
          state.isLoading = false;
        });
        toast.success('Logo updated successfully!');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update logo';
        set({ isLoading: false, error: errorMessage });
        toast.error(errorMessage);
      }
    },
  }))
);