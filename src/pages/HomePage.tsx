import React, { useEffect, useCallback } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets, Users, ShoppingCart, Banknote, Truck, UserPlus, FilePlus } from 'lucide-react';
import { useDashboardStore } from '@/stores/dashboardStore';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Toaster } from 'sonner';
import { formatCurrency } from '@/lib/currency';
export function HomePage() {
  const { data, isLoading, fetchDashboardData } = useDashboardStore();
  const memoizedFetch = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  useEffect(() => {
    memoizedFetch();
  }, [memoizedFetch]);
  const kpiData = data?.kpis ? [
    { title: 'Bottles in Stock', value: data.kpis.bottlesInStock.toLocaleString(), icon: Droplets, color: 'text-blue-500' },
    { title: 'Orders Today', value: data.kpis.ordersToday.toLocaleString(), icon: ShoppingCart, color: 'text-green-500' },
    { title: 'Total Customers', value: data.kpis.totalCustomers.toLocaleString(), icon: Users, color: 'text-purple-500' },
    { title: 'Pending Payments', value: formatCurrency(data.kpis.pendingPayments), icon: Banknote, color: 'text-orange-500' },
    { title: 'Deliveries Today', value: data.kpis.deliveriesToday.toLocaleString(), icon: Truck, color: 'text-teal-500' },
  ] : [];
  const renderActivityIcon = (type: 'order' | 'customer') => {
    if (type === 'order') return <FilePlus className="h-5 w-5 text-muted-foreground" />;
    return <UserPlus className="h-5 w-5 text-muted-foreground" />;
  };
  const renderActivityText = (activity: any) => {
    if (activity.type === 'order') {
      return <p className="text-sm"><span className="font-semibold">New Order</span> placed for customer ID {activity.customerId.slice(0, 8)}...</p>;
    }
    return <p className="text-sm"><span className="font-semibold">{activity.name}</span> joined as a new customer.</p>;
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Toaster richColors />
      <div className="py-8 md:py-10 lg:py-12">
        <div className="space-y-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {isLoading || !data
              ? Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-[108px] w-full" />)
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
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle>Sales Trends (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {isLoading || !data ? <Skeleton className="h-full w-full" /> : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.salesData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 'var(--radius)',
                          }}
                          formatter={(value: number, name) => (name === 'Revenue' ? formatCurrency(value) : value)}
                        />
                        <Legend iconSize={10} />
                        <Bar dataKey="sales" fill="hsl(var(--primary))" name="Sales (Units)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="revenue" fill="hsl(var(--chart-2))" name="Revenue" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading || !data ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.recentActivity.length > 0 ? data.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          {renderActivityIcon(activity.type)}
                        </div>
                        <div>
                          {renderActivityText(activity)}
                          <p className="text-xs text-muted-foreground">
                            {(() => {
                              const date = new Date(activity.timestamp);
                              return !isNaN(date.getTime()) ? formatDistanceToNow(date, { addSuffix: true }) : '';
                            })()}
                          </p>
                        </div>
                      </div>
                    )) : <p className="text-sm text-muted-foreground text-center py-8">No recent activity.</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}