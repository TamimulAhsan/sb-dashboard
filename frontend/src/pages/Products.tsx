
import React, { useState, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Pencil, Trash2, Upload, Image } from 'lucide-react';
import { mockProducts } from '@/data/mockData';
import { Product } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const ProductsPage = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    product_name: '',
    details: '',
    price: 0,
    image: '/placeholder.svg',
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter products based on search term
  const filteredProducts = products.filter(
    product => product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Create a URL for the image preview
    const fileUrl = URL.createObjectURL(file);
    setPreviewImage(fileUrl);
    
    // Store the URL in formData
    setFormData(prev => ({
      ...prev,
      image: fileUrl,
    }));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleAddProduct = () => {
    const newProduct: Product = {
      ...formData as Product,
      product_id: Math.max(0, ...products.map(p => p.product_id)) + 1,
    };
    
    setProducts([...products, newProduct]);
    setFormData({
      product_name: '',
      details: '',
      price: 0,
      image: '/placeholder.svg',
    });
    setPreviewImage(null);
    setDialogOpen(false);
    
    toast({
      title: "Product added",
      description: `${newProduct.product_name} has been added successfully.`,
    });
  };

  const handleEditProduct = () => {
    if (!editingProduct) return;
    
    setProducts(products.map(p => 
      p.product_id === editingProduct.product_id ? { ...p, ...formData } : p
    ));
    setEditingProduct(null);
    setPreviewImage(null);
    setDialogOpen(false);
    
    toast({
      title: "Product updated",
      description: `${formData.product_name} has been updated successfully.`,
    });
  };

  const handleDeleteProduct = (productId: number) => {
    setProducts(products.filter(p => p.product_id !== productId));
    
    toast({
      title: "Product deleted",
      description: "The product has been deleted successfully.",
      variant: "destructive",
    });
  };

  const openAddDialog = () => {
    setEditingProduct(null);
    setFormData({
      product_name: '',
      details: '',
      price: 0,
      image: '/placeholder.svg',
    });
    setPreviewImage(null);
    setDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      product_name: product.product_name,
      details: product.details || '',
      price: product.price,
      image: product.image || '/placeholder.svg',
    });
    setPreviewImage(product.image || null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground">
          Manage your product inventory
        </p>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map(product => (
                <TableRow key={product.product_id}>
                  <TableCell>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={product.image || '/placeholder.svg'} alt={product.product_name} />
                      <AvatarFallback><Image className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{product.product_id}</TableCell>
                  <TableCell>{product.product_name}</TableCell>
                  <TableCell className="max-w-xs truncate">{product.details}</TableCell>
                  <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.product_id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct
                ? 'Edit the product details below.'
                : 'Fill in the details to add a new product.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-center">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg h-[150px] w-[150px] flex flex-col items-center justify-center cursor-pointer overflow-hidden relative"
                onClick={triggerFileInput}
              >
                {previewImage ? (
                  <img 
                    src={previewImage} 
                    alt="Product preview" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400" />
                    <p className="text-xs text-gray-500 mt-2">Click to upload</p>
                    <p className="text-xs text-gray-400">300x300 recommended</p>
                  </>
                )}
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>
            
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="product_name">Product Name</Label>
              <Input
                id="product_name"
                name="product_name"
                value={formData.product_name}
                onChange={handleInputChange}
                placeholder="Enter product name"
              />
            </div>
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="details">Product Description</Label>
              <Textarea
                id="details"
                name="details"
                value={formData.details || ''}
                onChange={handleInputChange}
                placeholder="Enter product description"
              />
            </div>
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price?.toString()}
                onChange={handleInputChange}
                placeholder="Enter product price"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={editingProduct ? handleEditProduct : handleAddProduct}
              disabled={!formData.product_name || !formData.price}
            >
              {editingProduct ? 'Save Changes' : 'Add Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Products = () => {
  return (
    <DashboardLayout>
      <ProductsPage />
    </DashboardLayout>
  );
};

export default Products;
