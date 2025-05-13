from django.core.management.base import BaseCommand
from dashboard.models import Product, Order
from faker import Faker
import random
from datetime import timedelta
from django.utils import timezone

class Command(BaseCommand):
    help = 'Seed the database with test products and orders'

    def handle(self, *args, **kwargs):
        fake = Faker()

        # Clear existing entries (optional)
        Product.objects.all().delete()
        Order.objects.all().delete()

        # --- Seed Products ---
        product_names = [
            "Wireless Headphones", "Smart Watch", "Bluetooth Speaker",
            "Laptop Backpack", "Wireless Charging Pad", "Digital Camera",
            "Gaming Mouse", "Mechanical Keyboard", "4K Monitor", "USB-C Hub"
        ]
        products = []

        for name in product_names:
            product = Product.objects.create(
                product_name=name,
                details=fake.sentence(),
                image="/placeholder.svg",
                price=round(random.uniform(20, 600), 2)
            )
            products.append(product)

        self.stdout.write(self.style.SUCCESS(f'Successfully added {len(products)} products'))

        # --- Seed Orders ---
        order_statuses = ['Pending', 'Processing', 'Shipped', 'Delivered']
        payment_statuses = ['Paid', 'Pending', 'Failed']

        for i in range(20):
            product = random.choice(products)
            quantity = random.randint(1, 3)
            amount = round(product.price * quantity, 2)

            Order.objects.create(
                order_number=f"ORD-{fake.unique.random_int(min=1000, max=9999)}",
                user_id=random.randint(1, 10),
                username=fake.user_name(),
                product_id=product.product_id,
                quantity=quantity,
                amount=amount,
                invoice_id=f"INV-{fake.unique.random_int(min=1000, max=9999)}",
                delivery_method=random.choice(["Standard Shipping", "Express Shipping"]),
                delivery_address=fake.address(),
                payment_method=random.choice(["Credit Card", "PayPal"]),
                payment_status=random.choice(payment_statuses),
                order_status=random.choice(order_statuses),
                timestamp=timezone.now() - timedelta(days=random.randint(0, 180))
            )

        self.stdout.write(self.style.SUCCESS('Successfully added 20 orders'))
