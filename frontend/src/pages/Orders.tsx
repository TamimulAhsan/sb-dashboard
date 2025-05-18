import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Eye } from 'lucide-react';
import { Order } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import api from '@/lib/api';

const getOrderStatusColor = (status: string | null) => {
  switch ((status || '').toLowerCase()) {
    case 'delivered': return 'success';
    case 'shipped': return 'info';
    case 'processing': return 'warning';
    case 'cancelled': return 'destructive';
    default: return 'muted';
  }
};

const getPaymentStatusColor = (status: string | null) => {
  switch ((status || '').toLowerCase()) {
    case 'paid': return 'success';
    case 'pending': return 'warning';
    case 'failed':
    case 'refunded': return 'destructive';
    default: return 'muted';
  }
};


const OrdersPage = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<{ product_id: number; product_name: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<string>('');
  const [editPaymentStatus, setEditPaymentStatus] = useState<string>('');

  useEffect(() => {
    api.get('orders/')
      .then(res => setOrders(res.data))
      .catch(err => console.error('Failed to load orders'));
  
    api.get('products/')
      .then(res => setProducts(res.data))
      .catch(err => console.error('Failed to load products'));
  }, []);
  

  // Filter orders based on search term and status filter
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (order.order_status?.toLowerCase() === statusFilter.toLowerCase());
    
    return matchesSearch && matchesStatus;
  });

  const getProductName = (productId: number) => {
    const product = products.find(p => p.product_id === productId);
    return product?.product_name || 'Unknown Product';
  };
  
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };
  
  const handleEditStatus = (order: Order) => {
    setSelectedOrder(order);
    setEditStatus(order.order_status || '');
    setEditPaymentStatus(order.payment_status || '');
    setEditDialogOpen(true);
  };
  
  const handleSaveStatus = async () => {
    if (!selectedOrder) {
      console.error("❌ selectedOrder is null — cannot update.");
      return;
    }
  
    try {
      await api.patch(`orders/${selectedOrder.order_number}/`, {
        order_status: editStatus,
        payment_status: editPaymentStatus,
      });
  
      const updatedOrders = orders.map(order =>
        order.order_number === selectedOrder.order_number
          ? { ...order, order_status: editStatus, payment_status: editPaymentStatus }
          : order
      );
  
      setOrders(updatedOrders);
      setEditDialogOpen(false);
  
      toast({
        title: 'Order updated',
        description: `Order #${selectedOrder.order_number} status has been updated.`,
      });
    } catch (err) {
      console.error('❌ Failed to update order:', err);
      toast({
        title: 'Error',
        description: 'Failed to update the order. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
    
  const orderStatusOptions = [
    'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'
  ];
  
  const paymentStatusOptions = [
    'Pending', 'Paid', 'Failed', 'Refunded'
  ];
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">
          View and manage customer orders
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search orders..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order List</CardTitle>
          <CardDescription>
            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Products</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map(order => (
                <TableRow key={order.order_number}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>{order.username}</TableCell>
                  <TableCell>
                    {Array.isArray(order.products) ? order.products.join(', ') : 'Unknown Product'}
                  </TableCell>
                  <TableCell className="text-right">
                    ${order.total_amount ? parseFloat(order.total_amount).toFixed(2) : '0.00'}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.order_status} />
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={order.payment_status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleViewOrder(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditStatus(order)}>
                        Update
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.order_number}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Customer</h3>
                  <p className="text-sm">{selectedOrder.username}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">User ID</h3>
                  <p className="text-sm">{selectedOrder.user_id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Product</h3>
                  <p className="text-sm">{Array.isArray(selectedOrder.products) ? selectedOrder.products.join(', ') : 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Quantity</h3>
                    <p className="text-sm">{selectedOrder.products?.length || 0}</p>
                  </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Amount</h3>
                  <p className="text-sm">
                    ${selectedOrder.total_amount ? parseFloat(selectedOrder.total_amount).toFixed(2) : '0.00'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Invoice</h3>
                  <p className="text-sm">{selectedOrder.invoice_id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Order Status</h3>
                  <OrderStatusBadge status={selectedOrder.order_status} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Payment Status</h3>
                  <PaymentStatusBadge status={selectedOrder.payment_status} />
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Delivery Method</h3>
                <p className="text-sm">{selectedOrder.delivery_method || 'Not specified'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Delivery Address</h3>
                <p className="text-sm">{selectedOrder.delivery_address || 'Not specified'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Payment Method</h3>
                <p className="text-sm">{selectedOrder.payment_method || 'Not specified'}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setViewDialogOpen(false);
              handleEditStatus(selectedOrder!);
            }}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Status Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.order_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="order-status">Order Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger id="order-status">
                  <SelectValue placeholder="Select order status" />
                </SelectTrigger>
                <SelectContent>
                  {orderStatusOptions.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="payment-status">Payment Status</Label>
              <Select value={editPaymentStatus} onValueChange={setEditPaymentStatus}>
                <SelectTrigger id="payment-status">
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatusOptions.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveStatus}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const OrderStatusBadge = ({ status }: { status: string | null }) => {
  const getStatusColorClass = () => {
    const statusColor = getOrderStatusColor(status);
    return cn(
      "px-2 py-1 text-xs rounded-full font-medium",
      {
        'bg-success/20 text-success': statusColor === 'success',
        'bg-info/20 text-info': statusColor === 'info',
        'bg-warning/20 text-warning': statusColor === 'warning',
        'bg-destructive/20 text-destructive': statusColor === 'destructive',
        'bg-muted/20 text-muted-foreground': statusColor === 'muted',
      }
    );
  };
  
  return (
    <span className={getStatusColorClass()}>
      {status || 'Unknown'}
    </span>
  );
};

const PaymentStatusBadge = ({ status }: { status: string | null }) => {
  const getStatusColorClass = () => {
    const statusColor = getPaymentStatusColor(status);
    return cn(
      "px-2 py-1 text-xs rounded-full font-medium",
      {
        'bg-success/20 text-success': statusColor === 'success',
        'bg-warning/20 text-warning': statusColor === 'warning',
        'bg-destructive/20 text-destructive': statusColor === 'destructive',
        'bg-muted/20 text-muted-foreground': statusColor === 'muted',
      }
    );
  };
  
  return (
    <span className={getStatusColorClass()}>
      {status || 'Unknown'}
    </span>
  );
};

const Orders = () => {
  return (
    <DashboardLayout>
      <OrdersPage />
    </DashboardLayout>
  );
};

export default Orders;
