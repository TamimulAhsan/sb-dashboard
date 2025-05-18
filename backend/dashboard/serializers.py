from rest_framework import serializers
from django.db.models import Sum
from .models import Product, Order, Cart, Wishlist, Review, Category, OrderItem


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'


class OrderSerializer(serializers.ModelSerializer):
    products = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'order_number',
            'user_id',
            'username',
            'invoice_id',
            'delivery_method',
            'delivery_address',
            'payment_method',
            'payment_status',
            'order_status',
            'timestamp',
            'products',
            'total_amount',
        ]

    def get_products(self, obj):
        items = OrderItem.objects.filter(order_number=obj.order_number)
        result = []
        for item in items:
            product = Product.objects.filter(product_id=item.product_id).first()
            if product:
                result.append(f"{product.product_name} ×{item.quantity}")
        return result

    def get_total_amount(self, obj):
        total = OrderItem.objects.filter(order_number=obj.order_number).aggregate(
            total=Sum('amount')
        )['total']
        return float(total or 0.0)


class CartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cart
        fields = '__all__'


class WishlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wishlist
        fields = '__all__'


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'
