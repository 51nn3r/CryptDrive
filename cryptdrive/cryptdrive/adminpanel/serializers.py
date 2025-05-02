from django.contrib.auth import get_user_model
from rest_framework import serializers
from core.models import Group, File

User = get_user_model()


class UserAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_active', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class GroupAdminSerializer(serializers.ModelSerializer):
    members = serializers.PrimaryKeyRelatedField(many=True, queryset=User.objects.all())
    files = serializers.PrimaryKeyRelatedField(many=True, queryset=File.objects.all())

    class Meta:
        model = Group
        fields = ['id', 'name', 'owner', 'members', 'files', 'created']
        read_only_fields = ['id', 'owner', 'created']


class FileAdminSerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = File
        fields = ['id', 'filename', 'owner', 'size', 'created_at']
        read_only_fields = ['id', 'created_at']
