import React, { useEffect, useCallback } from 'react';
import { Truck, PackageSearch } from 'lucide-react';
import { useDeliveryStore } from '@/stores/deliveryStore';
import { useCustomerStore } from '@/stores/customerStore';
import { DeliveryCard } from '@/components/delivery/DeliveryCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/sonner';
import { Order } from '@shared/types';
export function DeliveriesPage() {
  const deliveries = useDeliveryStore((state) => state.deliveries);
  const isLoading = useDeliveryStore((state) => state.isLoading);
  const fetchDeliveries = useDeliveryStore((state) => state.fetchDeliveries);
  const updateDeliveryStatus = useDeliveryStore((state) => state.updateDeliveryStatus);
  const updatePaymentStatus = useDeliveryStore((state) => state.updatePaymentStatus);
  const fetchCustomers = useCustomerStore((state) => state.fetchCustomers);
  const memoizedFetchData = useCallback(() => {
    fetchDeliveries();
    fetchCustomers();
  }, [fetchDeliveries, fetchCustomers]);
  useEffect(() => {
    memoizedFetchData();
  }, [memoizedFetchData]);
  const handleUpdateDeliveryStatus = (id: string, status: Order['status']) => {
    updateDeliveryStatus(id, status);
  };
  const handleUpdatePaymentStatus = (id: string, paymentStatus: Order['paymentStatus']) => {
    updatePaymentStatus(id, paymentStatus);
  };
  const renderContent = () => {
    if (isLoading && deliveries.length === 0) {
      return (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[280px] w-full" />
          ))}
        </div>
      );
    }
    if (deliveries.length === 0) {
      return (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <PackageSearch className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-semibold">No Deliveries Assigned</h3>
          <p className="mt-1 text-sm text-muted-foreground">You have no pending deliveries for today.</p>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        {deliveries.map((delivery) => (
          <DeliveryCard
            key={delivery.id}
            delivery={delivery}
            onUpdateDeliveryStatus={handleUpdateDeliveryStatus}
            onUpdatePaymentStatus={handleUpdatePaymentStatus}
          />
        ))}
      </div>
    );
  };
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <Toaster richColors />
      <div className="py-8 md:py-10 lg:py-12">
        <div className="flex items-center gap-4 mb-8">
          <Truck className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Deliveries</h1>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}