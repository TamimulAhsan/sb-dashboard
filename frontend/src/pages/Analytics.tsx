
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, LineChart, PieChart } from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import api from '@/lib/api';


const AnalyticsPage = () => {

  const [productStats, setProductStats] = useState([]);

  const [orderStats, setOrderStats] = useState<{
    total_orders: number;
    order_frequency: number;
    monthly_order_trend: { month: string; count: number }[];
  } | null>(null);

  const [revenueStats, setRevenueStats] = useState<{
    total_revenue: number;
    average_order_value: number;
    monthly_revenue_trend: { month: string; amount: number }[];
  } | null>(null);
  
  
  
  useEffect(() => {
    api.get('analytics/products/')
      .then(res => setProductStats(res.data))
      .catch(err => console.error('Product analytics fetch failed:', err));
    
    api.get('analytics/orders/')
      .then(res => setOrderStats(res.data))
      .catch(err => console.error('Order analytics fetch failed:', err));

    api.get('analytics/revenue/')
      .then(res => setRevenueStats(res.data))
      .catch(err => console.error('Revenue analytics fetch failed:', err));
    
  }, []);
  

  if (!productStats.length || !orderStats || !revenueStats) {
    return <p className="text-muted-foreground">Loading analytics...</p>;
  }
  

  const totalRevenue = productStats.reduce((sum, p) => sum + p.revenue, 0);

  const topProductsForPieChart = productStats.map(product => ({
    name: product.product_name,
    value: product.sales
  }));


  // Custom product colors
  const classyPalette = [
    "indigo",
    "pink",
    "green",
    "amber",
    "teal",
    "rose",
    "violet",
    "orange",
    "blue",
    "purple",
  ];
      
  
  const productColorMap = productStats.reduce((map, product, index) => {
    map[product.product_name] = classyPalette[index % classyPalette.length];
    return map;
  }, {} as Record<string, string>);
  

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          View detailed analytics about your business performance
        </p>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total Revenue</CardTitle>
                <CardDescription>Current year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">£{revenueStats.total_revenue.toFixed(2)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Average Order Value</CardTitle>
                <CardDescription>Current year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">£{revenueStats.average_order_value.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue for the past year</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart
                data={revenueStats.monthly_revenue_trend.map(item => ({
                  date: item.month,
                  amount: item.amount,
                }))}
                index="date"
                categories={["amount"]}
                colors={["primary"]}
                valueFormatter={(value) => `£${value}`}
                yAxisWidth={60}
                className="h-96"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>By number of units sold</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChart
                  data={topProductsForPieChart}
                  index="name"
                  category="value"
                  colors={productStats.map(p => productColorMap[p.product_name])}
                  valueFormatter={(value) => `${value} units`}
                  className="h-80"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Product Performance</CardTitle>
                <CardDescription>By revenue generated</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={productStats}
                  index="product_name"
                  categories={["revenue"]}
                  colors={["#8B5CF6"]}
                  valueFormatter={(value) => `£${value.toFixed(2)}`}
                  className="h-80"
                />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Product Sales Comparison</CardTitle>
              <CardDescription>Units sold vs revenue generated</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                data={productStats}
                index="product_name"
                categories={["sales", "revenue"]}
                colors={["#F97316", "#0EA5E9"]}
                valueFormatter={(value, category) => 
                  category === "revenue" ? `£${value.toFixed(2)}` : `${value} units`
                }
                className="h-96"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total Orders</CardTitle>
                <CardDescription>Current year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                {orderStats ? orderStats.total_orders : '...'}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Order Frequency</CardTitle>
                <CardDescription>Orders per customer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                {orderStats ? orderStats.order_frequency : '...'}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Order Trend</CardTitle>
              <CardDescription>Monthly order count</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart
                data={orderStats?.monthly_order_trend.map(item => ({
                  date: item.month,
                  orders: item.count,
                })) || []}
                index="date"
                categories={["orders"]}
                colors={["primary"]}
                valueFormatter={(value) => `${value} orders`}
                yAxisWidth={60}
                className="h-96"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Analytics = () => {
  return (
    <DashboardLayout>
      <AnalyticsPage />
    </DashboardLayout>
  );
};

export default Analytics;
