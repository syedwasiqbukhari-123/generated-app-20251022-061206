import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { OrderWithDetails } from '@/stores/orderStore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
interface OrdersDataTableProps {
  orders: OrderWithDetails[];
  onEdit: (order: OrderWithDetails) => void;
  onDelete: (order: OrderWithDetails) => void;
}
export const OrdersDataTable: React.FC<OrdersDataTableProps> = ({ orders, onEdit, onDelete }) => {
  const getStatusBadge = (status: OrderWithDetails['status']) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };
  const getPaymentStatusBadge = (status: OrderWithDetails['paymentStatus']) => {
    return status === 'Paid'
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
  };
  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Delivery Date</TableHead>
            <TableHead className="text-center">Items</TableHead>
            <TableHead>Order Status</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.customerName || 'N/A'}</TableCell>
              <TableCell>{format(new Date(order.deliveryDate), 'MMM d, yyyy')}</TableCell>
              <TableCell className="text-center">{order.totalItems || order.items.length}</TableCell>
              <TableCell>
                <Badge className={cn('text-xs', getStatusBadge(order.status))}>{order.status}</Badge>
              </TableCell>
              <TableCell>
                <Badge className={cn('text-xs', getPaymentStatusBadge(order.paymentStatus))}>{order.paymentStatus}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(order)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(order)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};