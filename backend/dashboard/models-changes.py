# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class Cart(models.Model):
    pk = models.CompositePrimaryKey('userID', 'product_id')
    userid = models.BigIntegerField(db_column='userID')  # Field name made lowercase.
    username = models.CharField(max_length=255)
    product_id = models.IntegerField()
    quantity = models.IntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'cart'


class ClientObj(models.Model):
    client_blob = models.TextField()

    class Meta:
        managed = False
        db_table = 'client_obj'


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.PositiveSmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey('UsersCustomuser', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class OrderItems(models.Model):
    order_number = models.ForeignKey('Orders', models.DO_NOTHING, db_column='order_number', to_field='order_number')
    product_id = models.IntegerField()
    quantity = models.IntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'order_items'


class Orders(models.Model):
    order_number = models.CharField(unique=True, max_length=255)
    userid = models.BigIntegerField(db_column='userID', blank=True, null=True)  # Field name made lowercase.
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


class Products(models.Model):
    product_id = models.AutoField(primary_key=True)
    product_name = models.CharField(max_length=255)
    category = models.CharField(max_length=255, blank=True, null=True)
    details = models.TextField(blank=True, null=True)
    image = models.CharField(max_length=255, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'products'


class Review(models.Model):
    pk = models.CompositePrimaryKey('userID', 'product_id', 'order_number')
    userid = models.IntegerField(db_column='userID')  # Field name made lowercase.
    username = models.CharField(max_length=255)
    product_id = models.IntegerField()
    rating = models.IntegerField(blank=True, null=True)
    review = models.TextField(blank=True, null=True)
    order_number = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'review'


class UsersCustomuser(models.Model):
    id = models.BigAutoField(primary_key=True)
    password = models.CharField(max_length=128)
    is_superuser = models.IntegerField()
    username = models.CharField(unique=True, max_length=150)
    email = models.CharField(unique=True, max_length=254)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    role = models.CharField(max_length=50, blank=True, null=True)
    profile_image = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.IntegerField()
    is_staff = models.IntegerField()
    last_login = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'users_customuser'


class UsersCustomuserGroups(models.Model):
    id = models.BigAutoField(primary_key=True)
    customuser = models.ForeignKey(UsersCustomuser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'users_customuser_groups'
        unique_together = (('customuser', 'group'),)


class UsersCustomuserUserPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    customuser = models.ForeignKey(UsersCustomuser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'users_customuser_user_permissions'
        unique_together = (('customuser', 'permission'),)


class Wishlist(models.Model):
    pk = models.CompositePrimaryKey('userID', 'product_id')
    userid = models.BigIntegerField(db_column='userID')  # Field name made lowercase.
    username = models.CharField(max_length=255)
    product_id = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'wishlist'
