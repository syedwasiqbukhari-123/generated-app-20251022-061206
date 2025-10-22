import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/lib/api-client';
import { Product } from '@shared/types';
import { toast } from 'sonner';
type InventoryState = {
  products: Product[];
  isLoading: boolean;
  error: string | null;
};
type InventoryActions = {
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product | undefined>;
  updateProduct: (id: string, product: Partial<Omit<Product, 'id'>>) => Promise<Product | undefined>;
};
export const useInventoryStore = create<InventoryState & InventoryActions>()(
  immer((set) => ({
    products: [],
    isLoading: false,
    error: null,
    fetchProducts: async () => {
      set({ isLoading: true, error: null });
      try {
        const data = await api<{ items: Product[] }>('/api/products');
        set((state) => {
          state.products = data.items;
          state.isLoading = false;
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch products';
        set({ isLoading: false, error: errorMessage });
        toast.error(errorMessage);
      }
    },
    addProduct: async (productData) => {
      set({ isLoading: true });
      try {
        const newProduct = await api<Product>('/api/products', {
          method: 'POST',
          body: JSON.stringify(productData),
        });
        set((state) => {
          state.products.push(newProduct);
          state.isLoading = false;
        });
        toast.success('Product added successfully!');
        return newProduct;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to add product';
        set({ isLoading: false, error: errorMessage });
        toast.error(errorMessage);
        return undefined;
      }
    },
    updateProduct: async (id, productUpdate) => {
      set({ isLoading: true });
      try {
        const updatedProduct = await api<Product>(`/api/products/${id}`, {
          method: 'PUT',
          body: JSON.stringify(productUpdate),
        });
        set((state) => {
          const index = state.products.findIndex((p) => p.id === id);
          if (index !== -1) {
            state.products[index] = updatedProduct;
          }
          state.isLoading = false;
        });
        toast.success('Product updated successfully!');
        return updatedProduct;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update product';
        set({ isLoading: false, error: errorMessage });
        toast.error(errorMessage);
        return undefined;
      }
    },
  }))
);