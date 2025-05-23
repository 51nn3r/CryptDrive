import os

from rest_framework import serializers

from django.contrib.auth import get_user_model
from django.utils.text import get_valid_filename

from .models import File, Group

User = get_user_model()


class UserRegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'password_confirm', 'email']

    def validate(self, data):
        errors = {}

        if not data.get('username'):
            errors['username'] = ['This field is required.']

        if not data.get('password'):
            errors['password'] = ['This field is required.']

        if not data.get('password_confirm'):
            errors['password_confirm'] = ['This field is required.']

        if data.get('password') and data.get('password_confirm') and data['password'] != data['password_confirm']:
            errors['password_confirm'] = ['Passwords do not match.']

        if errors:
            raise serializers.ValidationError(errors)

        return data


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        errors = {}

        if not data.get('username'):
            errors['username'] = ['This field is required.']

        if not data.get('password'):
            errors['password'] = ['This field is required.']

        if errors:
            raise serializers.ValidationError(errors)

        return data


class EncryptedFileUploadSerializer(serializers.Serializer):
    filename = serializers.CharField()
    iv = serializers.CharField()
    encFile = serializers.FileField()
    encAES = serializers.CharField()

    def validate_filename(self, value):
        return get_valid_filename(os.path.basename(value))


class FileListSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['id', 'filename', 'owner', 'created_at']


class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


class ShareFileSerializer(serializers.Serializer):
    file_id = serializers.IntegerField()
    recipient_id = serializers.IntegerField()
    encrypted_sym_key = serializers.CharField()


class GroupSerializer(serializers.ModelSerializer):
    members = serializers.SerializerMethodField()
    files = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ['id', 'name', 'created', 'members', 'files']

    def get_members(self, obj):
        return list(
            obj.members.values('id', 'username')
        )

    def get_files(self, obj):
        files = obj.files.all()
        return FileListSerializer(files, many=True).data
