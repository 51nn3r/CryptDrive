from pathlib import Path

from django.core.serializers import serialize
from django.db import transaction
from django.http import JsonResponse, FileResponse
from django.shortcuts import redirect, get_object_or_404
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.generic import TemplateView
from django.contrib.auth import get_user_model, authenticate, login, logout
from django.conf import settings
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.status import HTTP_200_OK
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from .models import File, SharedKey, Group
from .serializers import (
    UserRegisterSerializer,
    UserLoginSerializer,
    EncryptedFileUploadSerializer,
    FileListSerializer,
    UserListSerializer,
    ShareFileSerializer, GroupSerializer,
)
from .services import (
    save_public_key,
    user_has_public_key,
    get_public_key,
    save_encrypted_file,
    save_shared_key,
)
from .permissions import IsOwner

from .utils import (
    get_accessible_files,
    get_user_decryptable_files,
    get_users_should_have_keys_for_file,
    get_users_with_access_to_file,
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
        user = request.user
        if user and user.is_authenticated:
            return Response(
                {"id": user.id, "username": user.username, "is_superuser": user.is_superuser, "detail": "User is already logged in."},
                status=status.HTTP_200_OK
            )
        return Response(
            {"detail": "Login endpoint. Use POST with {username, password}."},
            status=status.HTTP_200_OK
        )

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        user = authenticate(request, username=username, password=password)

        if user:
            login(request, user)
            return Response({"id": user.id, "msg": "Login successful", "username": user.username}, status=200)

        return Response({"error": "Invalid credentials"}, status=401)


class LogoutView(APIView):
    def get(self, request, *args, **kwargs):
        logout(request)
        return Response({"msg": "Logged out"}, status=status.HTTP_200_OK)


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
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id=None):
        if user_id is None:
            user = request.user
        else:
            user = User.objects.filter(id=user_id).first()
            if not user:
                return Response({"error": "User not found"}, status=404)

        has_key = user_has_public_key(user)

        return Response({"hasKey": has_key}, status=200)


class GetPublicKeyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id=None):
        if user_id is None:
            user = request.user
        else:
            user = User.objects.filter(id=user_id).first()
            if not user:
                return Response({"error": "User not found"}, status=404)

        key = get_public_key(user)
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


class ManageFileView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    @transaction.atomic
    def delete(self, request, file_id):
        file_obj = get_object_or_404(File, id=file_id)
        self.check_object_permissions(request, file_obj)

        file_path = Path(settings.MEDIA_ROOT) / file_obj.ciphertext_path
        if file_path.exists():
            file_path.unlink(missing_ok=True)

        file_obj.delete()
        return Response({'msg': 'File deleted'}, status=200)


class UserFileListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        shared_keys = SharedKey.objects.filter(recipient=request.user).select_related('file', 'file__owner')
        files = [shared_keys.file for shared_keys in shared_keys]
        serializer = FileListSerializer(files, many=True)

        return Response(serializer.data)


class FileMetaView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, file_id):
        file_obj = File.objects.filter(id=file_id).first()
        if not file_obj:
            return Response({'error': 'File not found'}, status=404)

        shared_key_obj = file_obj.shared_keys.filter(recipient=request.user).first()
        if not shared_key_obj:
            return Response({'error': 'Key not found'}, status=404)

        data = {
            "filename": file_obj.filename,
            "iv": file_obj.iv,
            "encryptedSymKey": shared_key_obj.encrypted_sym_key,
        }

        return Response(data, status=200)


class FileEncryptedDataView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, file_id):
        file_obj = File.objects.filter(id=file_id).first()
        if not file_obj:
            return Response({'error': 'File not found'}, status=404)

        shared_key_obj = file_obj.shared_keys.filter(recipient=request.user).first()
        if not shared_key_obj:
            return Response({'error': 'Access denied'}, status=404)

        file_path = Path(settings.MEDIA_ROOT) / file_obj.ciphertext_path

        if not file_path.is_file():
            return Response({'error': 'File not found on disk'}, status=404)

        return FileResponse(open(file_path, 'rb'), as_attachment=True, filename=file_obj.filename)


class UsersListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, search=''):
        users = User.objects.filter(
            username__icontains=search
        ).exclude(id=request.user.id).exclude(public_key=None)[:10]

        serializer = UserListSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ShareFileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ShareFileSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": serializer.errors}, status=400)

        file_id = serializer.validated_data['file_id']
        recipient_id = serializer.validated_data['recipient_id']
        encrypted_sym_key_b64 = serializer.validated_data['encrypted_sym_key']

        file_obj = get_object_or_404(File, id=file_id, owner=request.user)
        recipient = get_object_or_404(User, id=recipient_id)

        shared_key_obj, created = SharedKey.objects.update_or_create(
            file=file_obj,
            recipient=recipient,
            defaults={'encrypted_sym_key': encrypted_sym_key_b64},
        )
        return Response({
            'msg': 'File shared successfully',
            'shared_key_id': shared_key_obj.id
        })


class GroupView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get(self, request, id=None):
        if id is None:
            groups = Group.objects.filter(owner=request.user)
            serializer = GroupSerializer(groups, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        group = get_object_or_404(Group, pk=id, owner=request.user)
        serializer = GroupSerializer(group)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, id=None):
        serializer = GroupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, id=None):
        group = get_object_or_404(Group, pk=id, owner=request.user)
        ser = GroupSerializer(group, data=request.data, partial=True)
        if ser.is_valid():
            ser.save()
            return Response(ser.data, status=status.HTTP_200_OK)

        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

    @transaction.atomic
    def delete(self, request, id=None):
        group = get_object_or_404(Group, pk=id, owner=request.user)
        members = list(group.members.all())
        group.delete()

        for user in members:
            files_have_access_to = get_user_decryptable_files(user)
            files_should_have_access_to = get_accessible_files(user)
            files_diff = set(files_have_access_to) - set(files_should_have_access_to)
            SharedKey.objects.filter(
                recipient=user,
                file__in=files_diff
            ).delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class GroupMemberView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def post(self, request, id, user_id):
        group = get_object_or_404(Group, pk=id, owner=request.user)
        user = get_object_or_404(User, id=user_id)
        group.members.add(user)

        files_have_access_to = get_user_decryptable_files(user)
        files_should_have_access_to = get_accessible_files(user)
        files_diff = list(set(files_should_have_access_to) - set(files_have_access_to))

        return Response({
            'detail': f'{user.username} added',
            'missing_files': FileListSerializer(files_diff, many=True).data,
        }, status=status.HTTP_200_OK)

    def delete(self, request, id, user_id):
        group = get_object_or_404(Group, pk=id, owner=request.user)
        user = get_object_or_404(User, id=user_id)
        group.members.remove(user)

        files_have_access_to = get_user_decryptable_files(user)
        files_should_have_access_to = get_accessible_files(user)
        files_diff = set(files_have_access_to) - set(files_should_have_access_to)
        SharedKey.objects.filter(
            recipient=user,
            file__in=files_diff
        ).delete()

        return Response({
            'detail': f'{user.username} removed',
            'extra_files': FileListSerializer(list(files_diff), many=True).data,
        }, status=status.HTTP_200_OK)


class GroupFileView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    @transaction.atomic
    def post(self, request, id, file_id):
        group = get_object_or_404(Group, pk=id, owner=request.user)
        file = get_object_or_404(File, pk=file_id)
        group.files.add(file)

        users_have_access_to_file = get_users_should_have_keys_for_file(file)
        users_should_have_access_to_file = get_users_with_access_to_file(file)
        users_diff = list(set(users_have_access_to_file) - set(users_should_have_access_to_file))

        return Response({
            'detail': f'{file.filename} added',
            'missing_users': UserListSerializer(users_diff, many=True).data,
        }, status=status.HTTP_200_OK)

    @transaction.atomic
    def delete(self, request, id, file_id):
        group = get_object_or_404(Group, pk=id, owner=request.user)
        file = get_object_or_404(File, id=file_id)
        group.files.remove(file)

        users_have_access_to_file = get_users_should_have_keys_for_file(file)
        users_should_have_access_to_file = get_users_with_access_to_file(file)
        users_diff = list(set(users_should_have_access_to_file) - set(users_have_access_to_file))

        for extra_user in users_diff:
            key = get_object_or_404(SharedKey, file=file, recipient=extra_user)
            key.delete()

        return Response({
            'detail': f'{file.filename} added',
            'extra_users': UserListSerializer(users_diff, many=True).data,
        }, status=status.HTTP_200_OK)
