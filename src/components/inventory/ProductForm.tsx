import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Product } from '@shared/types';
const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters.'),
  price: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().positive('Price must be a positive number.').optional()
  ),
  stock: z.object({
    full: z.preprocess(
      (val) => (val === '' ? undefined : Number(val)),
      z.number().int().min(0, 'Stock cannot be negative.').optional()
    ),
    empty: z.preprocess(
      (val) => (val === '' ? undefined : Number(val)),
      z.number().int().min(0, 'Stock cannot be negative.').optional()
    ),
    defective: z.preprocess(
      (val) => (val === '' ? undefined : Number(val)),
      z.number().int().min(0, 'Stock cannot be negative.').optional()
    ),
  }),
});
export type ProductFormValues = z.infer<typeof productSchema>;
interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormValues) => void;
  defaultValues?: Product | null;
  isLoading: boolean;
}
export const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  isLoading,
}) => {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: 0,
      stock: { full: 0, empty: 0, defective: 0 },
    },
  });
  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    } else {
      form.reset({
        name: '',
        price: 0,
        stock: { full: 0, empty: 0, defective: 0 },
      });
    }
  }, [defaultValues, form, isOpen]);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{defaultValues ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {defaultValues ? 'Update the details for this product.' : 'Enter the details for the new product.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 19L Bottle" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (PKR)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="250" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-2">
              <FormLabel>Stock Levels</FormLabel>
              <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
                <FormField
                  control={form.control}
                  name="stock.full"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Full</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock.empty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Empty</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock.defective"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Defective</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Product'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};