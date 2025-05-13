from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, OrderViewSet, CartViewSet, WishlistViewSet, ReviewViewSet
from .views import DashboardSummaryView ,ProductAnalyticsView , OrderAnalyticsView, RevenueAnalyticsView

router = DefaultRouter()
router.register('products', ProductViewSet)
router.register('orders', OrderViewSet)
router.register('cart', CartViewSet)
router.register('wishlist', WishlistViewSet)
router.register('reviews', ReviewViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('analytics/products/', ProductAnalyticsView.as_view(), name='product-analytics'),
    path('analytics/orders/', OrderAnalyticsView.as_view(), name='order-analytics'),
    path('analytics/revenue/', RevenueAnalyticsView.as_view(), name='revenue-analytics'),


]
