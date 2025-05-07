
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, LineChart, PieChart } from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockRevenueData, mockProductPerformance, mockTopProducts } from '@/data/mockData';

const AnalyticsPage = () => {
  // Transform data for pie chart
  const topProductsForPieChart = mockTopProducts.map(product => ({
    name: product.product_name,
    value: product.sales
  }));

  // Calculate total revenue
  const totalRevenue = mockProductPerformance.reduce(
    (sum, product) => sum + product.revenue, 
    0
  );
  
  // Custom product colors
  const productColors = ["#8B5CF6", "#F97316", "#0EA5E9", "#10B981", "#EF4444", "#F59E0B"];

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
                <div className="text-3xl font-bold">${totalRevenue.toFixed(2)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Average Order Value</CardTitle>
                <CardDescription>Current year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">$145.80</div>
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
                data={mockRevenueData}
                index="date"
                categories={["amount"]}
                colors={["primary"]}
                valueFormatter={(value) => `$${value}`}
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
                  colors={productColors.map(color => color.replace('#', ''))}
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
                  data={mockProductPerformance}
                  index="product_name"
                  categories={["revenue"]}
                  colors={["#8B5CF6"]}
                  valueFormatter={(value) => `$${value.toFixed(2)}`}
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
                data={mockProductPerformance}
                index="product_name"
                categories={["sales", "revenue"]}
                colors={["#F97316", "#0EA5E9"]}
                valueFormatter={(value, category) => 
                  category === "revenue" ? `$${value.toFixed(2)}` : `${value} units`
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
                <div className="text-3xl font-bold">845</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Order Frequency</CardTitle>
                <CardDescription>Orders per customer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1.8</div>
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
                data={mockRevenueData.map(item => ({ date: item.date, orders: Math.floor(item.amount / 145.8) }))}
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
