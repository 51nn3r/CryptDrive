from django.urls import path

from .views import UserAdminViewSet, GroupAdminViewSet, FileAdminViewSet, SystemStatsView

urlpatterns = [
    # /adminpanel/users/
    path(
        'users/',
        UserAdminViewSet.as_view({
            'get': 'list',
            'post': 'create',
        }),
        name='admin-users-list',
    ),

    # /adminpanel/users/<pk>/
    path(
        'users/<int:pk>/',
        UserAdminViewSet.as_view({
            'get': 'retrieve',
            'put': 'update',
            'patch': 'partial_update',
            'delete': 'destroy',
        }),
        name='admin-users-detail',
    ),

    path(
        'groups/',
        GroupAdminViewSet.as_view({
            'get': 'list',
            'post': 'create',
        }),
        name='admin-groups-list',
    ),

    path(
        'groups/<int:pk>/',
        GroupAdminViewSet.as_view({
            'get': 'retrieve',
            'put': 'update',
            'patch': 'partial_update',
            'delete': 'destroy',
        }),
        name='admin-groups-detail',
    ),

    path(
        'files/',
        FileAdminViewSet.as_view({
            'get': 'list',
            'post': 'create',
        }),
        name='admin-files-list',
    ),

    path(
        'files/<int:pk>/',
        FileAdminViewSet.as_view({
            'get': 'retrieve',
            'put': 'update',
            'patch': 'partial_update',
            'delete': 'destroy',
        }),
        name='admin-files-detail',
    ),

    path(
        'system/',
        SystemStatsView.as_view(),
        name='admin-files-detail',
    ),
]
