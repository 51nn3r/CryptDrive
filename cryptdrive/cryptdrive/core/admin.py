from django.contrib import admin
from .models import User, File, SharedKey

admin.site.register(User)
admin.site.register(File)
admin.site.register(SharedKey)