from django.contrib import admin
from .models import User, File, SharedKey, Group

admin.site.register(User)
admin.site.register(File)
admin.site.register(SharedKey)
admin.site.register(Group)
