from rest_framework import viewsets
from .models import Product, Order, Cart, Wishlist, Review
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth

from .serializers import (
    ProductSerializer,
    OrderSerializer,
    CartSerializer,
    WishlistSerializer,
    ReviewSerializer
)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer

class WishlistViewSet(viewsets.ModelViewSet):
    queryset = Wishlist.objects.all()
    serializer_class = WishlistSerializer

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer


class DashboardSummaryView(APIView):
    def get(self, request):
        # Total revenue from paid orders
        total_revenue = (
            Order.objects.filter(payment_status='Paid')
            .aggregate(total=Sum('amount'))['total'] or 0
        )

        # Active orders: pending, processing, shipped
        active_orders = Order.objects.filter(
            order_status__in=['Pending', 'Processing', 'Shipped']
        ).count()

        # Total number of products
        total_products = Product.objects.count()

        # Distinct customers by user_id
        total_customers = (
            Order.objects.values('user_id').distinct().count()
        )

        # Revenue trend: Monthly revenue from paid orders
        monthly_totals = (
            Order.objects.filter(payment_status='Paid')
            .annotate(month=TruncMonth('timestamp'))
            .values('month')
            .annotate(amount=Sum('amount'))
            .order_by('month')
        )
        revenue_trend = [
            {'month': entry['month'].strftime('%b'), 'amount': float(entry['amount'])}
            for entry in monthly_totals
        ]

        # Recent 5 orders
        recent_orders = (
            Order.objects.order_by('-timestamp')[:5]
            .values('order_number', 'username', 'amount', 'order_status')
        )

        return Response({
            'total_revenue': float(total_revenue),
            'active_orders': active_orders,
            'total_products': total_products,
            'total_customers': total_customers,
            'revenue_trend': revenue_trend,
            'recent_orders': list(recent_orders),
        })