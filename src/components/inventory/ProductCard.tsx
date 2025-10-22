import React from 'react';
import { Product } from '@shared/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplets, Package, PackageCheck, PackageX, Pencil } from 'lucide-react';
interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
}
export const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit }) => {
  const totalStock = product.stock.full + product.stock.empty + product.stock.defective;
  return (
    <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Droplets className="h-5 w-5 text-primary" />
            {product.name}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>Total: {totalStock}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow grid grid-cols-3 gap-4 text-center">
        <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
          <PackageCheck className="h-6 w-6 text-green-500 mb-2" />
          <span className="text-2xl font-bold text-foreground">{product.stock.full}</span>
          <span className="text-xs text-muted-foreground">Full</span>
        </div>
        <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
          <Package className="h-6 w-6 text-yellow-500 mb-2" />
          <span className="text-2xl font-bold text-foreground">{product.stock.empty}</span>
          <span className="text-xs text-muted-foreground">Empty</span>
        </div>
        <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
          <PackageX className="h-6 w-6 text-red-500 mb-2" />
          <span className="text-2xl font-bold text-foreground">{product.stock.defective}</span>
          <span className="text-xs text-muted-foreground">Defective</span>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-end">
        <Button variant="outline" size="sm" onClick={() => onEdit(product)}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit Stock
        </Button>
      </CardFooter>
    </Card>
  );
};