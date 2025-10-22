import React from 'react';
import { Customer } from '@shared/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Phone, Bot, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
interface CustomerCardProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}
export const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onEdit, onDelete }) => {
  const getPaymentStatusBadge = (status: Customer['paymentStatus']) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Unpaid':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Partial':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };
  return (
    <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            {customer.name}
          </CardTitle>
          <Badge className={cn('text-xs', getPaymentStatusBadge(customer.paymentStatus))}>
            {customer.paymentStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 text-sm text-muted-foreground">
        <div className="flex items-start gap-3">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{customer.address}</span>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="h-4 w-4 flex-shrink-0" />
          <span>{customer.contact}</span>
        </div>
        <div className="flex items-center gap-3">
          <Bot className="h-4 w-4 flex-shrink-0" />
          <span>Bottle Balance: <span className="font-semibold text-foreground">{customer.bottleBalance}</span></span>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-end gap-2">
        <Button variant="ghost" size="icon" onClick={() => onEdit(customer)}>
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onDelete(customer)}>
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </CardFooter>
    </Card>
  );
};