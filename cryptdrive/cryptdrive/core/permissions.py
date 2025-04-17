from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """
    Temporary permission!!!
    @TODO: change to somthing else (to enable share access)
    """

    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user
