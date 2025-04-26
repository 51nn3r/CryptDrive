from django.db.models import Q
from .models import File, User


def get_accessible_files(user):
    """
    Returns a QuerySet of all file objects to which the user has any access,
    based on their files, files shared with them, and files accessible by groups.
    """
    return File.objects.filter(
        Q(owner=user) |
        Q(shared_to_groups__members=user)
    ).distinct()


def get_user_decryptable_files(user):
    """
    Returns a QuerySet of all files the user has keys for
    """
    return File.objects.filter(
        Q(owner=user) |
        Q(shared_keys__recipient=user)
    ).distinct()


def get_users_should_have_keys_for_file(file_obj):
    return User.objects.filter(
        Q(pk=file_obj.owner_id) |
        Q(member_groups__files=file_obj)
    ).distinct()


def get_users_with_access_to_file(file_obj):
    return User.objects.filter(
        Q(pk=file_obj.owner_id) |
        Q(received_keys__file=file_obj)
    ).distinct()
