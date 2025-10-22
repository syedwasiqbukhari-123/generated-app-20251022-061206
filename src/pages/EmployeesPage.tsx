import React, { useEffect, useState, useCallback } from 'react';
import { Plus, UserCog, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEmployeeStore } from '@/stores/employeeStore';
import { EmployeeForm, EmployeeFormValues } from '@/components/employee/EmployeeForm';
import { EmployeesDataTable } from '@/components/employee/EmployeesDataTable';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/sonner';
import { Employee } from '@shared/types';
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
export function EmployeesPage() {
  const employees = useEmployeeStore((state) => state.employees);
  const isLoading = useEmployeeStore((state) => state.isLoading);
  const fetchEmployees = useEmployeeStore((state) => state.fetchEmployees);
  const addEmployee = useEmployeeStore((state) => state.addEmployee);
  const updateEmployee = useEmployeeStore((state) => state.updateEmployee);
  const deleteEmployee = useEmployeeStore((state) => state.deleteEmployee);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const memoizedFetchEmployees = useCallback(() => {
    fetchEmployees();
  }, [fetchEmployees]);
  useEffect(() => {
    memoizedFetchEmployees();
  }, [memoizedFetchEmployees]);
  const handleAddClick = () => {
    setEditingEmployee(null);
    setIsFormOpen(true);
  };
  const handleEditClick = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };
  const handleDeleteClick = (employee: Employee) => {
    setDeletingEmployee(employee);
  };
  const handleFormSubmit = async (data: EmployeeFormValues) => {
    if (editingEmployee) {
      await updateEmployee(editingEmployee.id, data);
    } else {
      await addEmployee(data);
    }
    setIsFormOpen(false);
  };
  const confirmDelete = () => {
    if (deletingEmployee) {
      deleteEmployee(deletingEmployee.id);
      setDeletingEmployee(null);
    }
  };
  const renderContent = () => {
    if (isLoading && employees.length === 0) {
      return <Skeleton className="h-[400px] w-full" />;
    }
    if (employees.length === 0) {
      return (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-semibold">No Employees Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Get started by adding your first employee.</p>
          <div className="mt-6">
            <Button onClick={handleAddClick}>
              <Plus className="-ml-1 mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </div>
      );
    }
    return <EmployeesDataTable employees={employees} onEdit={handleEditClick} onDelete={handleDeleteClick} />;
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Toaster richColors />
      <div className="py-8 md:py-10 lg:py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <UserCog className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Employee Management</h1>
          </div>
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" /> Add Employee
          </Button>
        </div>
        {renderContent()}
      </div>
      <EmployeeForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        defaultValues={editingEmployee}
        isLoading={isLoading}
      />
      <AlertDialog open={!!deletingEmployee} onOpenChange={() => setDeletingEmployee(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee account for "{deletingEmployee?.name}".
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