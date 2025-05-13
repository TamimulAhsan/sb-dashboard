from django.core.management.base import BaseCommand
from dashboard.models import Product, Order, Cart, Wishlist, Review
from faker import Faker
import random
from datetime import timedelta
from django.utils import timezone


class Command(BaseCommand):
    help = 'Seed the database with test products, orders, cart, wishlist, and reviews'

    def handle(self, *args, **kwargs):
        fake = Faker()

        # Clear existing entries
        Product.objects.all().delete()
        Order.objects.all().delete()
        Cart.objects.all().delete()
        Wishlist.objects.all().delete()
        Review.objects.all().delete()

        # Product info
        product_data = [
            {
                "name": "Wireless Headphones",
                "category": "Electronics",
                "image": "https://picsum.photos/seed/headphones/400/300",
            },
            {
                "name": "Smart Watch",
                "category": "Electronics",
                "image": "https://picsum.photos/seed/smartwatch/400/300",
            },
            {
                "name": "Bluetooth Speaker",
                "category": "Electronics",
                "image": "https://picsum.photos/seed/speaker/400/300",
            },
            {
                "name": "Laptop Backpack",
                "category": "Accessories",
                "image": "https://picsum.photos/seed/backpack/400/300",
            },
            {
                "name": "Wireless Charging Pad",
                "category": "Accessories",
                "image": "https://picsum.photos/seed/charger/400/300",
            },
            {
                "name": "Digital Camera",
                "category": "Electronics",
                "image": "https://picsum.photos/seed/camera/400/300",
            },
            {
                "name": "Gaming Mouse",
                "category": "Computers",
                "image": "https://picsum.photos/seed/mouse/400/300",
            },
            {
                "name": "Mechanical Keyboard",
                "category": "Computers",
                "image": "https://picsum.photos/seed/keyboard/400/300",
            },
            {
                "name": "4K Monitor",
                "category": "Computers",
                "image": "https://picsum.photos/seed/monitor/400/300",
            },
            {
                "name": "USB-C Hub",
                "category": "Accessories",
                "image": "https://picsum.photos/seed/hub/400/300",
            },
        ]

        products = []
        for data in product_data:
            product = Product.objects.create(
                product_name=data["name"],
                category=data["category"],
                details=fake.sentence(),
                image=data["image"],
                price=round(random.uniform(30, 500), 2)
            )
            products.append(product)

        self.stdout.write(self.style.SUCCESS(f"✅ Seeded {len(products)} products"))

        # Seed orders
        orders = []
        for _ in range(20):
            product = random.choice(products)
            quantity = random.randint(1, 3)
            amount = round(product.price * quantity, 2)
            user_id = random.randint(1, 10)
            username = fake.user_name()
            order_number = f"ORD-{fake.unique.random_int(min=1000, max=9999)}"

            order = Order.objects.create(
                order_number=order_number,
                user_id=user_id,
                username=username,
                product_id=product.product_id,
                quantity=quantity,
                amount=amount,
                invoice_id=f"INV-{fake.unique.random_int(min=1000, max=9999)}",
                delivery_method=random.choice(["Standard Shipping", "Express Shipping"]),
                delivery_address=fake.address(),
                payment_method=random.choice(["Credit Card", "PayPal"]),
                payment_status=random.choice(["Paid", "Pending", "Failed"]),
                order_status=random.choice(["Pending", "Processing", "Shipped", "Delivered"]),
                timestamp=timezone.now() - timedelta(days=random.randint(0, 180))
            )
            orders.append((order, product, user_id, username))

        self.stdout.write(self.style.SUCCESS("✅ Seeded 20 orders"))

        # # Seed cart
        # for _ in range(10):
        #     product = random.choice(products)
        #     user_id = random.randint(1, 10)
        #     quantity = random.randint(1, 2)
        #     amount = round(product.price * quantity, 2)

        #     Cart.objects.get_or_create(
        #         user_id=user_id,
        #         username=fake.user_name(),
        #         product_id=product.product_id,
        #         defaults={"quantity": quantity, "amount": amount}
        #     )

        # self.stdout.write(self.style.SUCCESS("✅ Seeded 10 cart items"))

        # # Seed wishlist
        # for _ in range(10):
        #     product = random.choice(products)
        #     user_id = random.randint(1, 10)

        #     Wishlist.objects.get_or_create(
        #         user_id=user_id,
        #         username=fake.user_name(),
        #         product_id=product.product_id
        #     )

        # self.stdout.write(self.style.SUCCESS("✅ Seeded 10 wishlist items"))

        # Seed reviews
        # for order, product, user_id, username in random.sample(orders, 10):
        #     Review.objects.create(
        #         user_id=user_id,
        #         username=username,
        #         product_id=product.product_id,
        #         order_number=order.order_number,
        #         rating=random.randint(3, 5),
        #         review=fake.sentence()
        #     )

        # self.stdout.write(self.style.SUCCESS("✅ Seeded 10 reviews"))
