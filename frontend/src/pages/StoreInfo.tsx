import React, { useEffect, useRef, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const StoreInfoPage = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [formData, setFormData] = useState({
    about: '',
    contact_email: '',
    currency: '',
    delivery_fee: '',
    bank_details: '',
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    api.get('store-info/')
      .then(res => {
        const info = res.data || {};
        setStoreInfo(info);
        setFormData({
          about: info.about || '',
          contact_email: info.contact_email || '',
          currency: info.currency || '',
          delivery_fee: info.delivery_fee || '',
          bank_details: info.bank_details || '',
        });
        setPreviewImage(info.store_image || null);
      })
      .catch(() =>
        toast({
          title: 'Error',
          description: 'Failed to load store info',
          variant: 'destructive',
        })
      );
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    const form = new FormData();
    form.append('about', formData.about);
    form.append('contact_email', formData.contact_email);
    form.append('currency', formData.currency);
    form.append('delivery_fee', formData.delivery_fee);
    form.append('bank_details', formData.bank_details);
    if (fileInputRef.current?.files?.[0]) {
      form.append('store_image', fileInputRef.current.files[0]);
    }
  
    try {
      const res = await api.patch('store-info/1/', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStoreInfo(res.data);
      toast({ title: 'Store Info Saved' });
    } catch (err) {
      toast({ title: 'Error', description: 'Save failed', variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight">Store Information</h1>

        <Card>
          <CardHeader>
            <CardTitle>Edit Store Info</CardTitle>
            <CardDescription>Update store branding and operational details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center">
              <div
                className="border-2 border-dashed rounded-md p-4 w-40 h-40 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Store Preview"
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-sm text-gray-500">
                    <Upload className="w-6 h-6" />
                    Upload Image
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="about">About</Label>
              <Textarea id="about" name="about" value={formData.about} onChange={handleChange} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="delivery_fee">Delivery Fee</Label>
              <Input
                id="delivery_fee"
                name="delivery_fee"
                type="number"
                value={formData.delivery_fee}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bank_details">Bank Details</Label>
              <Textarea
                id="bank_details"
                name="bank_details"
                value={formData.bank_details}
                onChange={handleChange}
              />
            </div>

            <Button onClick={handleSubmit}>Save Changes</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StoreInfoPage;
