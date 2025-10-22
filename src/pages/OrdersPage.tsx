import React, { useEffect, useState, useCallback } from 'react';
import { Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrderStore, OrderWithDetails } from '@/stores/orderStore';
import { OrderForm, OrderFormValues } from '@/components/order/OrderForm';
import { OrdersDataTable } from '@/components/order/OrdersDataTable';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/sonner';
import { Order } from '@shared/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ExportButton } from '@/components/ExportButton';
export function OrdersPage() {
  const orders = useOrderStore((state) => state.orders);
  const isLoading = useOrderStore((state) => state.isLoading);
  const fetchOrders = useOrderStore((state) => state.fetchOrders);
  const addOrder = useOrderStore((state) => state.addOrder);
  const updateOrder = useOrderStore((state) => state.updateOrder);
  const deleteOrder = useOrderStore((state) => state.deleteOrder);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<OrderWithDetails | null>(null);
  const memoizedFetchOrders = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);
  useEffect(() => {
    memoizedFetchOrders();
  }, [memoizedFetchOrders]);
  const handleAddClick = () => {
    setEditingOrder(null);
    setIsFormOpen(true);
  };
  const handleEditClick = (order: OrderWithDetails) => {
    setEditingOrder(order);
    setIsFormOpen(true);
  };
  const handleDeleteClick = (order: OrderWithDetails) => {
    setDeletingOrder(order);
  };
  const handleFormSubmit = async (data: OrderFormValues) => {
    const orderData = {
      ...data,
      deliveryDate: data.deliveryDate.toISOString(),
    };
    if (editingOrder) {
      await updateOrder(editingOrder.id, { ...orderData, items: orderData.items.map(item => ({ ...item, quantity: Number(item.quantity) })) });
    } else {
      await addOrder({ ...orderData, items: orderData.items.map(item => ({ ...item, quantity: Number(item.quantity) })) });
    }
    setIsFormOpen(false);
    fetchOrders(); // Refetch to get updated list with details
  };
  const confirmDelete = () => {
    if (deletingOrder) {
      deleteOrder(deletingOrder.id);
      setDeletingOrder(null);
    }
  };
  const renderContent = () => {
    if (isLoading && orders.length === 0) {
      return <Skeleton className="h-[400px] w-full" />;
    }
    if (orders.length === 0) {
      return (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-semibold">No Orders Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new order.</p>
          <div className="mt-6">
            <Button onClick={handleAddClick}>
              <Plus className="-ml-1 mr-2 h-4 w-4" />
              Create Order
            </Button>
          </div>
        </div>
      );
    }
    return <OrdersDataTable orders={orders} onEdit={handleEditClick} onDelete={handleDeleteClick} />;
  };
  const formattedOrdersForExport = orders.map(o => ({
    orderId: o.id,
    customerName: o.customerName,
    deliveryDate: o.deliveryDate,
    status: o.status,
    paymentStatus: o.paymentStatus,
    totalItems: o.totalItems,
    notes: o.notes,
  }));
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Toaster richColors />
      <div className="py-8 md:py-10 lg:py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Orders</h1>
          <div className="flex items-center gap-2">
            <ExportButton data={formattedOrdersForExport} filename="aqua-flow-orders.csv" />
            <Button onClick={handleAddClick}>
              <Plus className="mr-2 h-4 w-4" /> Create Order
            </Button>
          </div>
        </div>
        {renderContent()}
      </div>
      <OrderForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        defaultValues={editingOrder}
        isLoading={isLoading}
      />
      <AlertDialog open={!!deletingOrder} onOpenChange={() => setDeletingOrder(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the order for customer "{deletingOrder?.customerName}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}