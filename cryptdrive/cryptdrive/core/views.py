from django.shortcuts import render, redirect
from django.views import View
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth import get_user_model

from .forms import RegisterForm

User = get_user_model()


class RegisterView(View):
    template_name = 'core/register.html'

    def get(self, request):
        form = RegisterForm()
        return render(request, self.template_name, context={'form': form})

    def post(self, request):
        form = RegisterForm(request.POST)

        if not form.is_valid():
            messages.error(request, "Please correct the errors below.")
            return render(request, self.template_name, {'form': form})

        username = form.cleaned_data['username']
        password = form.cleaned_data['password']
        user = User.objects.create_user(username=username, password=password)

        login(request, user)
        return redirect('core:dashboard')


class LoginView(View):
    template_name = 'core/login.html'

    def get(self, request):
        if request.user.is_authenticated:
            return redirect('core:dashboard')

        return render(request, self.template_name)

    def post(self, request):
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('core:dashboard')
        else:
            messages.error(request, "Invalid username or password")
            return render(request, self.template_name)


class LogoutView(View):
    def get(self, request):
        logout(request)
        return redirect('core:login')


class DashboardView(LoginRequiredMixin, View):
    template_name = 'core/dashboard.html'

    def get(self, request):
        return render(request, self.template_name, {'user': request.user})
