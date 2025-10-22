import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useCustomerStore } from '@/stores/customerStore';
import { useInventoryStore } from '@/stores/inventoryStore';
import { Order } from '@shared/types';
const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product is required.'),
  quantity: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().int().min(1, 'Quantity must be at least 1.')
  ),
});
const orderSchema = z.object({
  customerId: z.string().min(1, 'Customer is required.'),
  deliveryDate: z.date(),
  status: z.enum(['Pending', 'Delivered', 'Cancelled']),
  paymentStatus: z.enum(['Paid', 'Unpaid']),
  items: z.array(orderItemSchema).min(1, 'At least one product is required.'),
});
export type OrderFormValues = z.infer<typeof orderSchema>;
interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OrderFormValues) => void;
  defaultValues?: Order | null;
  isLoading: boolean;
}
export const OrderForm: React.FC<OrderFormProps> = ({ isOpen, onClose, onSubmit, defaultValues, isLoading }) => {
  const customers = useCustomerStore((state) => state.customers);
  const fetchCustomers = useCustomerStore((state) => state.fetchCustomers);
  const products = useInventoryStore((state) => state.products);
  const fetchProducts = useInventoryStore((state) => state.fetchProducts);
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerId: '',
      deliveryDate: new Date(),
      status: 'Pending',
      paymentStatus: 'Unpaid',
      items: [{ productId: '', quantity: 1 }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      fetchProducts();
    }
  }, [isOpen, fetchCustomers, fetchProducts]);
  useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...defaultValues,
        deliveryDate: new Date(defaultValues.deliveryDate),
      });
    } else {
      form.reset({
        customerId: '',
        deliveryDate: new Date(),
        status: 'Pending',
        paymentStatus: 'Unpaid',
        items: [{ productId: '', quantity: 1 }],
      });
    }
  }, [defaultValues, form, isOpen]);
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-lg w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{defaultValues ? 'Edit Order' : 'Create New Order'}</SheetTitle>
          <SheetDescription>
            {defaultValues ? 'Update the details for this order.' : 'Fill in the details to create a new order.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deliveryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Delivery Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <FormLabel>Products</FormLabel>
              <div className="space-y-4 mt-2">
                {fields.map((item, index) => (
                  <div key={item.id} className="flex items-start gap-2 p-3 border rounded-md">
                    <div className="grid grid-cols-5 gap-2 flex-grow">
                      <FormField
                        control={form.control}
                        name={`items.${index}.productId`}
                        render={({ field }) => (
                          <FormItem className="col-span-3">
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Product" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {products.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormControl>
                              <Input type="number" placeholder="Qty" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="mt-1 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: '', quantity: 1 })}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Unpaid">Unpaid</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" variant="outline" disabled={isLoading}>Cancel</Button>
              </SheetClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Order'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};