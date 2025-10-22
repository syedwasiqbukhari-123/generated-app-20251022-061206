import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFinanceStore } from '@/stores/financeStore';
import { Banknote, TrendingUp, TrendingDown, CircleDollarSign, Scale, Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { TransactionForm, TransactionFormValues } from '@/components/finance/TransactionForm';
import { ExportButton } from '@/components/ExportButton';
import { Transaction } from '@shared/types';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/currency';
export function FinancePage() {
  const { summary, transactions, isLoading, fetchFinanceData, addTransaction, updateTransaction, deleteTransaction } = useFinanceStore((state) => state);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const memoizedFetch = useCallback(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);
  useEffect(() => {
    memoizedFetch();
  }, [memoizedFetch]);
  const handleAddClick = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };
  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };
  const handleDeleteClick = (transaction: Transaction) => {
    setDeletingTransaction(transaction);
  };
  const handleFormSubmit = async (data: TransactionFormValues) => {
    const transactionData = { ...data, date: data.date.toISOString(), amount: Number(data.amount) };
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, transactionData);
    } else {
      await addTransaction(transactionData);
    }
    setIsFormOpen(false);
  };
  const confirmDelete = () => {
    if (deletingTransaction) {
      deleteTransaction(deletingTransaction.id);
      setDeletingTransaction(null);
    }
  };
  const kpiData = summary ? [
    { title: 'Total Revenue', value: formatCurrency(summary.revenue), icon: TrendingUp, color: 'text-green-500' },
    { title: 'Total Expenses', value: formatCurrency(summary.expenses), icon: TrendingDown, color: 'text-red-500' },
    { title: 'Outstanding Payments', value: formatCurrency(summary.outstandingPayments), icon: CircleDollarSign, color: 'text-orange-500' },
    { title: 'Net Profit', value: formatCurrency(summary.netProfit), icon: Scale, color: 'text-blue-500' },
  ] : [];
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Toaster richColors />
      <div className="py-8 md:py-10 lg:py-12">
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Banknote className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Finance Overview</h1>
            </div>
            <div className="flex items-center gap-2">
              <ExportButton data={transactions} filename="waterx-transactions.csv" />
              <Button onClick={handleAddClick}>
                <Plus className="mr-2 h-4 w-4" /> Add Transaction
              </Button>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {isLoading && !summary
              ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-[126px] w-full" />)
              : kpiData.map((kpi, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow duration-300 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                      <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{kpi.value}</div>
                    </CardContent>
                  </Card>
                ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && transactions.length === 0 ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>{format(new Date(tx.date), 'MMM d, yyyy')}</TableCell>
                          <TableCell className="font-medium">{tx.description}</TableCell>
                          <TableCell><Badge variant="outline">{tx.category}</Badge></TableCell>
                          <TableCell>
                            <Badge className={tx.type === 'Revenue' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {tx.type}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-right font-semibold ${tx.type === 'Revenue' ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(tx.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditClick(tx)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteClick(tx)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        defaultValues={editingTransaction}
        isLoading={isLoading}
      />
      <AlertDialog open={!!deletingTransaction} onOpenChange={() => setDeletingTransaction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the transaction: "{deletingTransaction?.description}".</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}