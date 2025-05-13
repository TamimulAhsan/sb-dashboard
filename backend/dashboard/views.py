from rest_framework import viewsets
from .models import Product, Order, Cart, Wishlist, Review
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from rest_framework import viewsets, filters
from rest_framework.pagination import PageNumberPagination


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
    filter_backends = [filters.SearchFilter]
    search_fields = ['order_number', 'username', 'order_status']
    pagination_class = PageNumberPagination

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


class ProductAnalyticsView(APIView):
    def get(self, request):
        # Aggregate sales and revenue by product_id
        order_data = (
            Order.objects.values('product_id')
            .annotate(
                sales=Sum('quantity'),
                revenue=Sum('amount')
            )
            .order_by('-sales')
        )

        # Fetch product names from Product table
        product_map = {
            p.product_id: p.product_name for p in Product.objects.all()
        }

        results = []
        for item in order_data:
            product_id = item['product_id']
            results.append({
                "product_id": product_id,
                "product_name": product_map.get(product_id, "Unknown Product"),
                "sales": item['sales'],
                "revenue": float(item['revenue'])
            })

        return Response(results)

class OrderAnalyticsView(APIView):
    def get(self, request):
        total_orders = Order.objects.count()
        total_customers = Order.objects.values('user_id').distinct().count()

        order_frequency = round(total_orders / total_customers, 2) if total_customers > 0 else 0

        monthly_data = (
            Order.objects.annotate(month=TruncMonth('timestamp'))
            .values('month')
            .annotate(count=Count('order_number'))
            .order_by('month')
        )

        monthly_order_trend = [
            {"month": entry["month"].strftime("%b"), "count": entry["count"]}
            for entry in monthly_data
        ]

        return Response({
            "total_orders": total_orders,
            "order_frequency": order_frequency,
            "monthly_order_trend": monthly_order_trend
        })

class RevenueAnalyticsView(APIView):
    def get(self, request):
        paid_orders = Order.objects.filter(payment_status='Paid')

        total_revenue = paid_orders.aggregate(total=Sum('amount'))['total'] or 0
        total_orders = paid_orders.count()
        average_order_value = round(total_revenue / total_orders, 2) if total_orders else 0

        monthly_data = (
            paid_orders.annotate(month=TruncMonth('timestamp'))
            .values('month')
            .annotate(amount=Sum('amount'))
            .order_by('month')
        )

        monthly_revenue_trend = [
            {"month": entry["month"].strftime("%b"), "amount": float(entry["amount"])}
            for entry in monthly_data
        ]

        return Response({
            "total_revenue": float(total_revenue),
            "average_order_value": average_order_value,
            "monthly_revenue_trend": monthly_revenue_trend,
        })

