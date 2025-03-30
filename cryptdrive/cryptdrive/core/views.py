from django.http import JsonResponse
from django.shortcuts import redirect
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.generic import TemplateView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model, authenticate, login, logout

from core.serializers import UserRegisterSerializer, UserLoginSerializer

User = get_user_model()


@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'detail': 'CSRF cookie set'})


class ReactBaseView(TemplateView):
    template_name = 'index.html'


class RegisterView(APIView):
    def get(self, request):
        return Response({
            "detail": "Register endpoint. Use POST with {username, password, password_confirm}"
        }, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=serializer.validated_data['username']).exists():
            return Response({'error': {"username": ["User with this username already exists"]}},
                            status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create(
            username=serializer.validated_data['username'],
            email=serializer.validated_data.get('email', ''),
            password=serializer.validated_data['password']
        )
        user.set_password(serializer.validated_data['password'])
        user.save()

        return Response({
            "msg": "User created",
            "username": user.username
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    def get(self, request):
        return Response({
            "detail": "Login endpoint. Use POST with {username, password}"
        }, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        user = authenticate(request, username=username, password=password)

        if user:
            login(request, user)
            return Response({"msg": "Login successful", "username": user.username}, status=200)

        return Response({"error": "Invalid credentials"}, status=401)


class LogoutView(APIView):
    def get(self, request, *args, **kwargs):
        logout(request)
        return redirect('core:login')
