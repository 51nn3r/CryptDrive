from rest_framework import serializers
from django.contrib.auth import get_user_model

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
