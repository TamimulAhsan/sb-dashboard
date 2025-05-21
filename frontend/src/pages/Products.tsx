
import React, { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Pencil, Trash2, Upload, Image } from 'lucide-react';
import { Product } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import api from '@/lib/api';


const ProductsPage = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    product_name: '',
    category: '',
    details: '',
    price: 0,
    image: '/placeholder.svg',
  });  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<{ category_id: number; name: string }[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [editingCategory, setEditingCategory] = useState<{ category_id: number; name: string } | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');


  useEffect(() => {
    api.get('products/')
      .then(res => setProducts(res.data))
      .catch(err => console.error('Failed to load products'));
    api.get('categories/')
      .then(res => setCategories(res.data))
      .catch(err => console.error('Failed to load categories'));
  }, []);


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


  const resetForm = () => {
    setFormData({ product_name: '', details: '', price: 0, image: '/placeholder.svg' });
    setPreviewImage(null);
    setEditingProduct(null);
  };
  

  const handleAddProduct = async () => {
    const form = new FormData();
    form.append('product_name', formData.product_name || '');
    form.append('category', formData.category || '');
    form.append('details', formData.details || '');
    form.append('price', String(formData.price || 0));
    if (fileInputRef.current?.files?.[0]) {
      form.append('image', fileInputRef.current.files[0]); // actual file
    }
  
    try {
      const res = await api.post('products/', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProducts(prev => [...prev, res.data]);
      toast({ title: 'Product added', description: `${res.data.product_name} added.` });
    } catch (err) {
      console.error('Upload failed:', err);
      toast({ title: 'Error', description: 'Could not add product.', variant: 'destructive' });
    } finally {
      setDialogOpen(false);
      resetForm();
    }
  };
  
  
  const handleEditProduct = async () => {
    if (!editingProduct) return;
  
    try {
      const form = new FormData();
      form.append("product_name", formData.product_name || '');
      form.append("category", formData.category || '');
      form.append("details", formData.details || '');
      form.append("price", formData.price?.toString() || '');
      if (fileInputRef.current?.files?.[0]) {
        form.append("image", fileInputRef.current.files[0]);
      }
  
      const res = await api.patch(
        `products/${editingProduct.product_id}/`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
  
      setProducts(prev =>
        prev.map(p => p.product_id === editingProduct.product_id ? res.data : p)
      );
      toast({ title: "Product updated", description: `${res.data.product_name} has been updated.` });
    } catch (err) {
      console.error("Failed to update product", err);
      toast({ title: "Error", description: "Could not update product", variant: "destructive" });
    } finally {
      setDialogOpen(false);
      resetForm();
    }
  };
  
  
  
  const handleDeleteProduct = async (productId: number) => {
    try {
      await api.delete(`products/${productId}/`);
      setProducts(prev => prev.filter(p => p.product_id !== productId));
      toast({ title: 'Product deleted', description: 'The product has been deleted.', variant: 'destructive' });
    } catch (err) {
      console.error('Failed to delete product', err);
      toast({ title: 'Error', description: 'Could not delete product', variant: 'destructive' });
    }
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
      category: product.category || '',
      details: product.details || '',
      price: product.price,
      image: product.image || '/placeholder.svg',
    });
    setPreviewImage(product.image || null);
    setDialogOpen(true);
  };


  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
  
    try {
      const res = await api.post('categories/', { name: newCategory });
      setCategories(prev => [...prev, res.data]);
      setNewCategory('');
      toast({ title: 'Category added', description: `${res.data.name} added successfully.` });
    } catch (err) {
      console.error('Failed to add category', err);
      toast({ title: 'Error', description: 'Could not add category', variant: 'destructive' });
    }
  };
  
  const handleDeleteCategory = async (id: number) => {
    try {
      await api.delete(`categories/${id}/`);
      setCategories(prev => prev.filter(c => c.category_id !== id));
      toast({ title: 'Category deleted', description: 'Category removed.', variant: 'destructive' });
    } catch (err) {
      console.error('Failed to delete category', err);
      toast({ title: 'Error', description: 'Could not delete category', variant: 'destructive' });
    }
  };
  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    try {
      const res = await api.patch(`categories/${editingCategory.category_id}/`, { name: categoryName });
      setCategories(prev =>
        prev.map(c => c.category_id === editingCategory.category_id ? res.data : c)
      );
      toast({ title: 'Category updated', description: `${res.data.name} has been updated.` });
      setCategoryDialogOpen(false);
      setEditingCategory(null);
      setCategoryName('');
    } catch (err) {
      console.error('Failed to update category', err);
      toast({ title: 'Error', description: 'Could not update category', variant: 'destructive' });
    }
  };
  

  const openEditCategoryDialog = (category: { category_id: number; name: string }) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground">Manage your product inventory and categories</p>

        <div className="flex items-center justify-between">
          <div className="flex space-x-2 rounded-md bg-muted p-1">
            <button
              className={`px-4 py-1 text-sm rounded-md ${activeTab === 'products' ? 'bg-white shadow text-primary' : 'text-muted-foreground'}`}
              onClick={() => setActiveTab('products')}
            >
              Products
            </button>
            <button
              className={`px-4 py-1 text-sm rounded-md ${activeTab === 'categories' ? 'bg-white shadow text-primary' : 'text-muted-foreground'}`}
              onClick={() => setActiveTab('categories')}
            >
              Categories
            </button>
          </div>

          {activeTab === 'products' && (
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          )}
          {/* {activeTab === 'categories' && (
            // <Button onClick={() => setCategoryDialogOpen(true)}>
            //   <Plus className="h-4 w-4 mr-2" />
            //   Add Category
            // </Button>
          )} */}
        </div>
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
        {/* <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button> */}
      </div>
      {activeTab === 'products' && (
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
                <TableHead>Category</TableHead>

                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map(product => (
                <TableRow key={product.product_id}>
                  <TableCell>
                    <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={`${product.image}`}
                      alt={product.product_name}
                    />
                    <AvatarFallback><Image className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{product.product_id}</TableCell>
                  <TableCell>{product.product_name}</TableCell>
                  <TableCell className="max-w-xs truncate">{product.details}</TableCell>
                  <TableCell>{product.category || 'N/A'}</TableCell>
                  <TableCell className="text-right">${product.price ? parseFloat(product.price).toFixed(2) : '0.00'}                  </TableCell>
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
      )}

      {activeTab === 'categories' && (
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>
              {categories.length} category{categories.length !== 1 ? 'ies' : 'y'}
            </CardDescription>
          </CardHeader>
          <CardContent>
          {activeTab === 'categories' && (
            <div className="flex items-center gap-2">
              <Input
                placeholder="New category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="max-w-sm"
              />
              <Button onClick={handleAddCategory}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>
          )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map(cat => (
                  <TableRow key={cat.category_id}>
                    <TableCell>{cat.category_id}</TableCell>
                    <TableCell>{cat.name}</TableCell>
                    <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditCategoryDialog(cat)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(cat.category_id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No categories found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}


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
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                value={formData.category || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="border rounded px-3 py-2 text-sm"
              >
                <option value="">Select category</option>
                {categories.map(c => (
                  <option key={c.category_id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
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

      <Dialog open={categoryDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setEditingCategory(null);
            setCategoryName('');
          }
          setCategoryDialogOpen(open);
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
              <DialogDescription>
                {editingCategory ? 'Update the category name below.' : 'Enter a new category name.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="category_name">Category Name</Label>
                <Input
                  id="category_name"
                  name="category_name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Enter category name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setCategoryDialogOpen(false);
                  setEditingCategory(null);
                  setCategoryName('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (editingCategory) {
                    handleUpdateCategory();
                  } else {
                    handleAddCategory();
                    setCategoryDialogOpen(false); // Close dialog after add
                  }
                }}
              >
                {editingCategory ? 'Save Changes' : 'Add Category'}
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
