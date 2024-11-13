from django.contrib import admin
from .models import User, Palace, Room, Item, Subtopic

# Register your models here.
admin.site.register(User)
admin.site.register(Palace)
admin.site.register(Room)
admin.site.register(Item)
admin.site.register(Subtopic)