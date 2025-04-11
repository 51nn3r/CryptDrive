from django.http import JsonResponse
from django.shortcuts import redirect
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.generic import TemplateView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import get_user_model, authenticate, login, logout

from .serializers import UserRegisterSerializer, UserLoginSerializer, EncryptedFileUploadSerializer
from .services import (
    save_public_key,
    user_has_public_key,
    get_public_key,
    save_encrypted_file, save_shared_key,
)

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


class UploadPublicKeyView(APIView):
    def post(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "Not authenticated"}, status=401)

        public_key_b64 = request.data.get('publicKey')
        if not public_key_b64:
            return Response({"error": "No publicKey provided"}, status=400)

        save_public_key(request.user, public_key_b64)
        return Response({"msg": "Public key saved"}, status=200)


class CheckPublicKeyView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "Not authenticated"}, status=401)

        has_key = user_has_public_key(request.user)
        return Response({"hasKey": has_key}, status=200)


class GetPublicKeyView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "Not authenticated"}, status=401)

        key = get_public_key(request.user)
        if not key:
            return Response({"error": "No public key found"}, status=404)

        return Response({"publicKey": key}, status=200)


class UploadEncryptedFileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = EncryptedFileUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        filename = serializer.validated_data['filename']
        iv = serializer.validated_data['iv']
        enc_file = serializer.validated_data['encFile']
        enc_aes = serializer.validated_data['encAES']

        file_obj = save_encrypted_file(request.user, filename, enc_file, iv)
        save_shared_key(file_obj, request.user, enc_aes)

        return Response({"msg": "Encrypted file saved"}, status=200)
