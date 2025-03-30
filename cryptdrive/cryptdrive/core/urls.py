from django.urls import path
from . import views
from .views import get_csrf_token

app_name = 'core'

urlpatterns = [
    path('csrf/', get_csrf_token, name='csrf'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    # path('dashboard/', views.DashboardView.as_view(), name='dashboard'),
]
