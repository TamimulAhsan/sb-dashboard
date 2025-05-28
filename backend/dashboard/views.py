# dashboard/views.py
from rest_framework import viewsets, filters, mixins, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Product, Order, OrderItem, Cart, Wishlist, Review, Category, StoreInfo
from .serializers import (
    ProductSerializer,
    OrderSerializer,
    CartSerializer,
    WishlistSerializer,
    ReviewSerializer,
    CategorySerializer,
    StoreInfoSerializer
)
from rest_framework.permissions import IsAuthenticated, AllowAny


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated] 

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context



class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['order_number', 'username', 'order_status']
    pagination_class = PageNumberPagination
    permission_classes = [IsAuthenticated] 

class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated] 

class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated] 


class WishlistViewSet(viewsets.ModelViewSet):
    queryset = Wishlist.objects.all()
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated] 


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated] 


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated] 


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated] 
    def get(self, request):
        total_revenue = (
            OrderItem.objects.filter(order_number__payment_status='Paid')
            .aggregate(total=Sum('amount'))['total'] or 0
        )

        active_orders = Order.objects.filter(
            order_status__in=['Pending', 'Processing', 'Shipped']
        ).count()

        total_products = Product.objects.count()

        total_customers = Order.objects.values('user_id').distinct().count()

        monthly_totals = (
            OrderItem.objects
            .filter(order_number__payment_status='Paid')
            .annotate(month=TruncMonth('order_number__timestamp'))
            .values('month')
            .annotate(amount=Sum('amount'))
            .order_by('month')
        )

        revenue_trend = [
            {'month': entry['month'].strftime('%b'), 'amount': float(entry['amount'])}
            for entry in monthly_totals
        ]

        recent_orders = []
        for order in Order.objects.order_by('-timestamp')[:5]:
            total = (
                OrderItem.objects
                .filter(order_number=order.order_number)
                .aggregate(total=Sum('amount'))['total'] or 0.0
            )
            recent_orders.append({
                "order_number": order.order_number,
                "username": order.username,
                "order_status": order.order_status,
                "total_amount": float(total)
            })

        return Response({
            "total_revenue": float(total_revenue),
            "active_orders": active_orders,
            "total_products": total_products,
            "total_customers": total_customers,
            "revenue_trend": revenue_trend,
            "recent_orders": recent_orders,
        })


class ProductAnalyticsView(APIView):
    permission_classes = [IsAuthenticated] 
    def get(self, request):
        order_data = (
            OrderItem.objects
            .filter(order_number__payment_status='Paid')
            .values('product_id')
            .annotate(sales=Sum('quantity'), revenue=Sum('amount'))
            .order_by('-sales')
        )

        product_map = {
            p.product_id: p.product_name for p in Product.objects.all()
        }

        results = [{
            'product_id': item['product_id'],
            'product_name': product_map.get(item['product_id'], 'Unknown Product'),
            'sales': item['sales'],
            'revenue': float(item['revenue'])
        } for item in order_data]

        return Response(results)


class OrderAnalyticsView(APIView):
    permission_classes = [IsAuthenticated] 
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
    permission_classes = [IsAuthenticated] 
    def get(self, request):
        paid_orders = Order.objects.filter(payment_status='Paid')

        order_items = OrderItem.objects.filter(order_number__in=paid_orders)

        total_revenue = order_items.aggregate(total=Sum('amount'))['total'] or 0
        total_orders = paid_orders.count()
        average_order_value = round(total_revenue / total_orders, 2) if total_orders else 0

        monthly_data = (
            order_items
            .annotate(month=TruncMonth('order_number__timestamp'))
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

class StoreInfoViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.UpdateModelMixin):
    queryset = StoreInfo.objects.all()
    serializer_class = StoreInfoSerializer
    permission_classes = [IsAuthenticated] 
    def get_object(self):
        return StoreInfo.objects.first()

    def list(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response({}, status=status.HTTP_200_OK)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)