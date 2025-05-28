import os
from dotenv import load_dotenv
import hmac
import hashlib
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from dashboard.models import Order
# Create your views here.

load_dotenv()
webhook_secret = os.getenv("BTCPAY_WEBHOOK_SECRET")


@csrf_exempt
def btcpay_webhook(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid Method"}, status = 405)
    
    try:
        payload = request.body
        signature = request.headers.get("BTCPay-Sig")

        #Verify signatuure
        expected_sig = "sha256=" + hmac.new(
            webhook_secret.encode(), payload, hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected_sig, signature or ""):
            return JsonResponse ({"error": "Invalid signature"}, status = 403)
        
        data = json.loads(payload)
        invoice_id = data.get("invoiceId")
        status = data.get("type")

        if not invoice_id or not status:
                return JsonResponse({"error": "Missing data"}, status=400)
    
        if status.lower() == "invoicesettled":
            payment_status = "Paid"
            order_status = "Processing"
        elif status.lower() == "invoiceexpired":
            payment_status = "Failed"
            order_status = "Cancelled"
        else:
             return JsonResponse({"message": "No action for this status"}, status = 400)
        
        # Implement status update here.
        try:
             order = Order.objects.get(invoice_id=invoice_id)
             order.payment_status = payment_status
             order.order_status = order_status
             order.save(update_fields=["payment_status", "order_status"])
        except Order.DoesNotExist:
            return JsonResponse({"error": "Order not found for invoice"}, status = 404)
        
        return JsonResponse({"message": "Status Updated"}, status = 200)
    
    except Exception as e:
         return JsonResponse({"error": str(e)}, status = 500)