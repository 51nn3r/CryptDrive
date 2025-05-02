from django.contrib.auth import get_user_model
from django.db.models import Sum
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import UserAdminSerializer, GroupAdminSerializer, FileAdminSerializer
from core.models import Group, File

User = get_user_model()


class IsSuperuser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)


class UserAdminViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserAdminSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperuser]


class GroupAdminViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all().order_by('-created')
    serializer_class = GroupAdminSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperuser]


class FileAdminViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all().order_by('-created_at')
    serializer_class = FileAdminSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperuser]


class SystemStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSuperuser]

    def get(self, request):
        total_size = File.objects.aggregate(total=Sum('size'))['total'] or 0
        print(total_size)
        return Response({
            "users": User.objects.count(),
            "groups": Group.objects.count(),
            "files": File.objects.count(),
            "disk_used_mb": round(total_size / 1_048_576, 2)
        }, status=status.HTTP_200_OK)
