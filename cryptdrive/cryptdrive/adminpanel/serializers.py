from django.contrib.auth import get_user_model
from rest_framework import serializers
from core.models import Group, File

User = get_user_model()


class UserAdminSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_active', 'is_superuser', 'date_joined', 'password']
        read_only_fields = ['id', 'date_joined']


class GroupAdminSerializer(serializers.ModelSerializer):
    members = serializers.PrimaryKeyRelatedField(many=True, required=False, queryset=User.objects.all())
    files = serializers.PrimaryKeyRelatedField(many=True, required=False, queryset=File.objects.all())

    class Meta:
        model = Group
        fields = ['id', 'name', 'owner', 'members', 'files', 'created']
        read_only_fields = ['id', 'created']
        unique_together = [('owner', 'name')]

    def create(self, validated_data):
        members = validated_data.pop('members', [])
        group = super().create(validated_data)
        if members:
            group.members.set(members)

        return group


class FileAdminSerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = File
        fields = ['id', 'filename', 'owner', 'size', 'created_at']
        read_only_fields = ['id', 'created_at']
