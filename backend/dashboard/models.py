from django.db import models
from django.core.validators import FileExtensionValidator
import os

def product_image_upload_path(instance, filename):
    # Always save as <product_id>.png under product_images/
    ext = os.path.splitext(filename)[1]
    return f"product_images/{instance.product_id}{ext}" if instance.product_id else "product_images/temp.png"

class Category(models.Model):
    category_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, unique=True)

    class Meta:
        managed = False
        db_table = 'categories'

    def __str__(self):
        return self.name


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
        # Save once to ensure product_id is available
        if not self.product_id:
            super().save(*args, **kwargs)

        # Update image name only if a new image is set
        if self.image and hasattr(self.image, 'name') and not self.image.name.startswith(f"product_images/{self.product_id}"):
            ext = os.path.splitext(self.image.name)[1]
            self.image.name = f"product_images/{self.product_id}{ext}"

        super().save(*args, **kwargs)

    class Meta:
        managed = False
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
