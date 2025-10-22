import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCustomerStore } from '@/stores/customerStore';
import { CustomerCard } from '@/components/customer/CustomerCard';
import { CustomerForm, CustomerFormValues } from '@/components/customer/CustomerForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Customer } from '@shared/types';
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
import { Toaster } from '@/components/ui/sonner';
import { ExportButton } from '@/components/ExportButton';
export function CustomersPage() {
  const fetchCustomers = useCustomerStore((state) => state.fetchCustomers);
  const customers = useCustomerStore((state) => state.customers);
  const isLoading = useCustomerStore((state) => state.isLoading);
  const addCustomer = useCustomerStore((state) => state.addCustomer);
  const updateCustomer = useCustomerStore((state) => state.updateCustomer);
  const deleteCustomer = useCustomerStore((state) => state.deleteCustomer);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const memoizedFetch = useCallback(() => {
    fetchCustomers();
  }, [fetchCustomers]);
  useEffect(() => {
    memoizedFetch();
  }, [memoizedFetch]);
  const handleAddClick = () => {
    setEditingCustomer(null);
    setIsFormOpen(true);
  };
  const handleEditClick = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };
  const handleDeleteClick = (customer: Customer) => {
    setDeletingCustomer(customer);
  };
  const handleFormSubmit = async (data: CustomerFormValues) => {
    if (editingCustomer) {
      await updateCustomer(editingCustomer.id, { ...data, bottleBalance: Number(data.bottleBalance) });
    } else {
      await addCustomer({ ...data, bottleBalance: Number(data.bottleBalance) });
    }
    setIsFormOpen(false);
  };
  const confirmDelete = () => {
    if (deletingCustomer) {
      deleteCustomer(deletingCustomer.id);
      setDeletingCustomer(null);
    }
  };
  const renderContent = () => {
    if (isLoading && customers.length === 0) {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-[220px] w-full" />
          ))}
        </div>
      );
    }
    if (customers.length === 0) {
      return (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-semibold">No Customers Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Get started by adding your first customer.</p>
          <div className="mt-6">
            <Button onClick={handleAddClick}>
              <Plus className="-ml-1 mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {customers.map((customer) => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        ))}
      </div>
    );
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Toaster richColors />
      <div className="py-8 md:py-10 lg:py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Customers</h1>
          <div className="hidden sm:flex items-center gap-2">
            <ExportButton data={customers} filename="aqua-flow-customers.csv" />
            <Button onClick={handleAddClick}>
              <Plus className="mr-2 h-4 w-4" /> Add Customer
            </Button>
          </div>
        </div>
        {renderContent()}
      </div>
      <Button
        onClick={handleAddClick}
        className="sm:hidden fixed bottom-4 right-4 rounded-full w-14 h-14 shadow-lg"
        size="icon"
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">Add Customer</span>
      </Button>
      <CustomerForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        defaultValues={editingCustomer}
        isLoading={isLoading}
      />
      <AlertDialog open={!!deletingCustomer} onOpenChange={() => setDeletingCustomer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer "{deletingCustomer?.name}" and all associated data.
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