
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, LineChart, AreaChart } from '@/components/ui/chart';
import { Package, ShoppingCart, DollarSign, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '@/lib/api';


interface DashboardData {
  total_products: number;
  active_orders: number;
  total_revenue: number;
  total_customers: number;
  revenue_trend: { month: string; amount: number }[];
  recent_orders: {
    order_number: string;
    username: string;
    total_amount: number;
    order_status: string;
  }[];
}

const DashboardOverview = () => {

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  
  useEffect(() => {
    api.get('dashboard/summary/')
      .then(res => setDashboardData(res.data))
      .catch(err => console.error('Dashboard load failed:', err));
  }, []);

  if (!dashboardData) {
    return <p className="text-muted-foreground">Loading dashboard...</p>;
  }

  const totalProducts = dashboardData.total_products;
  const activeOrders = dashboardData.active_orders;
  const totalRevenue = dashboardData.total_revenue;
  const recentOrders = dashboardData.recent_orders;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Welcome back, Admin</p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Total Revenue" 
          value={`$${(totalRevenue ?? 0).toFixed(2)}`}
          description="Total revenue from all orders" 
          icon={<DollarSign />}
        />
        <MetricCard 
          title="Active Orders" 
          value={activeOrders.toString()} 
          description="Orders in pending, processing or shipped status" 
          icon={<ShoppingCart />}
        />
        <MetricCard 
          title="Products" 
          value={totalProducts.toString()} 
          description="Total products in inventory" 
          icon={<Package />}
        />
        <MetricCard 
          title="Customers" 
          value={dashboardData.total_customers.toString()} 
          description="Total registered customers" 
          icon={<Users />}
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue for the past year</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <AreaChart
              data={dashboardData.revenue_trend}
              index="date"
              categories={["amount"]}
              colors={["primary"]}
              valueFormatter={(value) => `$${value}`}
              yAxisWidth={60}
              className="h-72"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest 5 orders received</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.order_number} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{order.order_number}</p>
                    <p className="text-xs text-muted-foreground">{order.username}</p>
                  </div>
                  <div className="text-right">
                  <p className="text-sm font-medium">
                    ${order.total_amount ? order.total_amount.toFixed(2) : '0.00'}
                  </p>
                    <StatusBadge status={order.order_status} />
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" asChild className="w-full mt-2">
                <Link to="/orders" className="flex items-center justify-center gap-1">
                  View All Orders
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

const MetricCard = ({ title, value, description, icon }: MetricCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn("p-2 rounded-full", "bg-primary/10 text-primary")}>
          {React.cloneElement(icon as React.ReactElement, { className: "h-4 w-4" })}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const StatusBadge = ({ status }: { status: string | null }) => {
  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-success/20 text-success';
      case 'shipped': return 'bg-info/20 text-info';
      case 'processing': return 'bg-warning/20 text-warning';
      case 'pending': return 'bg-muted/20 text-muted-foreground';
      case 'cancelled': return 'bg-destructive/20 text-destructive';
      default: return 'bg-muted/20 text-muted-foreground';
    }
  };
  
  return (
    <span className={cn("px-2 py-0.5 text-xs rounded-full font-medium", getStatusColor())}>
      {status || 'Unknown'}
    </span>
  );
};

const Dashboard = () => {
  return (
    <DashboardLayout>
      <DashboardOverview />
    </DashboardLayout>
  );
};

export default Dashboard;
