from django.db import models
from django.core.validators import FileExtensionValidator
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os


class Category(models.Model):
    category_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, unique=True)

    class Meta:
        managed = False
        db_table = 'categories'

    def __str__(self):
        return self.name


# def product_image_upload_path(instance, filename):
#     return f"product_images/{instance.product_id}.png" if instance.product_id else "product_images/temp.png"

def product_image_upload_path(instance, filename):
    # ext = filename.split('.')[-1]
    # return f"product_images/{instance.product_id or 'temp'}.{ext}"
    return f"product_images/temp_{filename}"


class Product(models.Model):
    product_id = models.AutoField(primary_key=True)
    product_name = models.CharField(max_length=255)
    category = models.CharField(max_length=255, blank=True, null=True)
    details = models.TextField(blank=True, null=True)
    
    image = models.ImageField(
        upload_to=product_image_upload_path,
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['png'])]
    )

    price = models.DecimalField(max_digits=10, decimal_places=2)

    def save(self, *args, **kwargs):
        is_new = self._state.adding  # True if creating

        # Save initially to get product_id
        super().save(*args, **kwargs)

        if is_new and self.image:
            # Read the current file
            temp_image_path = self.image.name
            extension = os.path.splitext(temp_image_path)[1]
            new_image_name = f"product_images/{self.product_id}{extension}"

            # Rename the image
            image_content = self.image.read()
            self.image.delete(save=False)  # Delete temp image
            self.image.save(new_image_name, ContentFile(image_content), save=False)

            # Save again to commit the new image path
            super().save(update_fields=["image"])



    # def save(self, *args, **kwargs):
    #     is_new = self.pk is None
    #     original_image = self.image
    
    #     # Save once to get product_id
    #     super().save(*args, **kwargs)
    
    #     # Rename image only if it's not already correctly named
    #     if original_image and original_image.name != f"product_images/{self.product_id}.png":
    #         # Go to beginning of file
    #         original_image.seek(0)
    #         image_data = original_image.read()
    
    #         new_image_name = f"product_images/{self.product_id}.png"
    
    #         # Save under new name
    #         self.image.save(new_image_name, ContentFile(image_data), save=False)
    
    #         # Delete old (temp) file
    #         if default_storage.exists(original_image.name):
    #             default_storage.delete(original_image.name)
    
    #         # Save the model again to update DB
    #         super().save(update_fields=["image"])


    class Meta:
        managed = True
        db_table = 'products'

    def __str__(self):
        return self.product_name

class Order(models.Model):
    order_number = models.CharField(primary_key=True, max_length=255)
    user_id = models.BigIntegerField(db_column='userID', blank=True, null=True)
    username = models.CharField(max_length=255)
    invoice_id = models.CharField(max_length=255)
    delivery_method = models.CharField(max_length=50, blank=True, null=True)
    delivery_address = models.TextField(blank=True, null=True)
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    payment_status = models.CharField(max_length=50, blank=True, null=True)
    order_status = models.CharField(max_length=50, blank=True, null=True)
    timestamp = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'orders'

    def __str__(self):
        return self.order_number


class OrderItem(models.Model):
    order_number = models.ForeignKey(Order, models.DO_NOTHING, db_column='order_number', to_field='order_number')
    product_id = models.IntegerField()
    quantity = models.IntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'order_items'


class Cart(models.Model):
    user_id = models.BigIntegerField(db_column='userID')
    username = models.CharField(max_length=255)
    product_id = models.IntegerField()
    quantity = models.IntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'cart'
        unique_together = (('user_id', 'product_id'),)


class Wishlist(models.Model):
    user_id = models.BigIntegerField(db_column='userID')
    username = models.CharField(max_length=255)
    product_id = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'wishlist'
        unique_together = (('user_id', 'product_id'),)


class Review(models.Model):
    user_id = models.IntegerField(db_column='userID')
    username = models.CharField(max_length=255)
    product_id = models.IntegerField()
    order_number = models.CharField(max_length=255)
    rating = models.IntegerField(blank=True, null=True)
    review = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'review'
        unique_together = (('user_id', 'product_id', 'order_number'),)
        
def store_image_upload_path(instance, filename):
    return "store_info/store_image.png"  # Always same name to overwrite

class StoreInfo(models.Model):
    id = models.AutoField(primary_key=True)

    store_image = models.ImageField(
        upload_to=store_image_upload_path,
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['png'])]
    )

    about = models.TextField(blank=True, null=True)
    contact_email = models.CharField(max_length=100, blank=True, null=True)
    currency = models.CharField(max_length=15, blank=True, null=True)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    bank_details = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        # Delete old file if a new one is being uploaded
        if self.pk:
            try:
                old_obj = StoreInfo.objects.get(pk=self.pk)
                if (
                    old_obj.store_image and
                    old_obj.store_image.name != self.store_image.name and
                    default_storage.exists(old_obj.store_image.name)
                ):
                    default_storage.delete(old_obj.store_image.name)
            except StoreInfo.DoesNotExist:
                pass

        super().save(*args, **kwargs)

    class Meta:
        db_table = 'store_info'
        managed = False  # Set to True if Django should manage migrations

    def __str__(self):
        return f"Store Info #{self.id}"
