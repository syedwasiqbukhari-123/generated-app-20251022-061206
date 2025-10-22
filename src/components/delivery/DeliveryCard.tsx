import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MapPin, Phone, Package, CheckCircle2, CircleDollarSign, ExternalLink } from 'lucide-react';
import { OrderWithDetails } from '@/stores/orderStore';
import { useCustomerStore } from '@/stores/customerStore';
import { format } from 'date-fns';
interface DeliveryCardProps {
  delivery: OrderWithDetails;
  onUpdateDeliveryStatus: (id: string, status: OrderWithDetails['status']) => void;
  onUpdatePaymentStatus: (id: string, status: OrderWithDetails['paymentStatus']) => void;
}
export const DeliveryCard: React.FC<DeliveryCardProps> = ({ delivery, onUpdateDeliveryStatus, onUpdatePaymentStatus }) => {
  const customer = useCustomerStore((state) => state.customers.find(c => c.id === delivery.customerId));
  const handleMarkDelivered = () => {
    onUpdateDeliveryStatus(delivery.id, 'Delivered');
  };
  const handlePaymentReceived = () => {
    onUpdatePaymentStatus(delivery.id, 'Paid');
  };
  const openGoogleMaps = () => {
    if (customer?.address) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customer.address)}`;
      window.open(url, '_blank');
    }
  };
  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{delivery.customerName}</CardTitle>
            <p className="text-sm text-muted-foreground">Delivery for {format(new Date(delivery.deliveryDate), 'MMM d, yyyy')}</p>
          </div>
          {delivery.status === 'Delivered' && (
            <div className="flex items-center gap-2 text-green-600 font-semibold p-2 bg-green-100 dark:bg-green-900/50 rounded-md">
              <CheckCircle2 className="h-5 w-5" />
              <span>Delivered</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 mt-1 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="font-medium">{customer?.address || 'Address not available'}</p>
            <Button variant="link" size="sm" className="p-0 h-auto" onClick={openGoogleMaps}>
              View on Map <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <p className="font-medium">{customer?.contact || 'Contact not available'}</p>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <p className="font-medium">Items: {delivery.totalItems}</p>
          </div>
          <div className="flex items-center gap-3">
            <CircleDollarSign className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <p className="font-medium">Payment: <span className={delivery.paymentStatus === 'Paid' ? 'text-green-600' : 'text-orange-500'}>{delivery.paymentStatus}</span></p>
          </div>
        </div>
      </CardContent>
      {delivery.status !== 'Delivered' && (
        <CardFooter className="grid grid-cols-2 gap-2">
          <Button
            size="lg"
            onClick={handlePaymentReceived}
            disabled={delivery.paymentStatus === 'Paid'}
            variant="outline"
          >
            <CircleDollarSign className="mr-2 h-4 w-4" />
            Payment Received
          </Button>
          <Button size="lg" onClick={handleMarkDelivered}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark as Delivered
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};