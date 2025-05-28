from django.urls import path
from .views import btcpay_webhook

urlpatterns = [
    path('btcpay/', btcpay_webhook, name='btcpay_webhook'),
]