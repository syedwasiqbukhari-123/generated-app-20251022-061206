import React, { useEffect, useState, useCallback } from 'react';
import { Plus, PackageSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInventoryStore } from '@/stores/inventoryStore';
import { ProductCard } from '@/components/inventory/ProductCard';
import { ProductForm, ProductFormValues } from '@/components/inventory/ProductForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Product } from '@shared/types';
import { Toaster } from '@/components/ui/sonner';
import { ExportButton } from '@/components/ExportButton';
export function InventoryPage() {
  const fetchProducts = useInventoryStore((state) => state.fetchProducts);
  const products = useInventoryStore((state) => state.products);
  const isLoading = useInventoryStore((state) => state.isLoading);
  const addProduct = useInventoryStore((state) => state.addProduct);
  const updateProduct = useInventoryStore((state) => state.updateProduct);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const memoizedFetch = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);
  useEffect(() => {
    memoizedFetch();
  }, [memoizedFetch]);
  const handleAddClick = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };
  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };
  const handleFormSubmit = async (data: ProductFormValues) => {
    const numericData = {
      ...data,
      price: Number(data.price),
      stock: {
        full: Number(data.stock.full),
        empty: Number(data.stock.empty),
        defective: Number(data.stock.defective),
      },
    };
    if (editingProduct) {
      await updateProduct(editingProduct.id, numericData);
    } else {
      await addProduct(numericData);
    }
    setIsFormOpen(false);
  };
  const renderContent = () => {
    if (isLoading && products.length === 0) {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[240px] w-full" />
          ))}
        </div>
      );
    }
    if (products.length === 0) {
      return (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <PackageSearch className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-semibold">No Products Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Get started by adding your first product.</p>
          <div className="mt-6">
            <Button onClick={handleAddClick}>
              <Plus className="-ml-1 mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onEdit={handleEditClick} />
        ))}
      </div>
    );
  };
  const formattedInventoryForExport = products.map(p => ({
    productId: p.id,
    productName: p.name,
    price: p.price,
    fullBottles: p.stock.full,
    emptyBottles: p.stock.empty,
    defectiveBottles: p.stock.defective,
  }));
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Toaster richColors />
      <div className="py-8 md:py-10 lg:py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Inventory</h1>
          <div className="flex items-center gap-2">
            <ExportButton data={formattedInventoryForExport} filename="aqua-flow-inventory.csv" />
            <Button onClick={handleAddClick}>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </div>
        </div>
        {renderContent()}
      </div>
      <ProductForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        defaultValues={editingProduct}
        isLoading={isLoading}
      />
    </div>
  );
}