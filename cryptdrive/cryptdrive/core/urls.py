from django.urls import path
from . import views
from .views import (
    get_csrf_token,
    UploadPublicKeyView,
    CheckPublicKeyView,
    GetPublicKeyView,
    UploadEncryptedFileView,
    UserFileListView,
    FileMetaView,
    FileEncryptedDataView,
    UsersListView,
    ShareFileView,
    ManageFileView,
    GroupView,
    GroupMemberView,
    GroupFileView,
)

app_name = 'core'

urlpatterns = [
    path('csrf/', get_csrf_token, name='csrf'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('upload-public-key/', UploadPublicKeyView.as_view(), name='upload-pubkey'),
    path('has-public-key/', CheckPublicKeyView.as_view(), name='has-pubkey-default'),
    path('has-public-key/<int:user_id>', CheckPublicKeyView.as_view(), name='has-pubkey'),
    path('get-public-key/', GetPublicKeyView.as_view(), name='get-pubkey-default'),
    path('get-public-key/<int:user_id>', GetPublicKeyView.as_view(), name='get-pubkey'),
    path('upload-encrypted/', UploadEncryptedFileView.as_view(), name='upload-encrypted'),
    path('files/', UserFileListView.as_view(), name='file-list'),
    path('manage-file/<int:file_id>', ManageFileView.as_view(), name='file-manage'),
    path('download/<int:file_id>/meta/', FileMetaView.as_view(), name='file-meta-download'),
    path('download/<int:file_id>/data/', FileEncryptedDataView.as_view(), name='file-data-download'),
    path('list-users/', UsersListView.as_view(), name='list-users-default'),
    path('list-users/<str:search>', UsersListView.as_view(), name='list-users'),
    path('share-file/', ShareFileView.as_view(), name='file-share'),
    path('groups/', GroupView.as_view(), name='group-manage-default'),
    path('groups/<int:id>', GroupView.as_view(), name='group-manage'),
    path('groups/<int:id>/members/<int:user_id>', GroupMemberView.as_view(), name='group-members-manage'),
    path('groups/<int:id>/files/<int:file_id>', GroupFileView.as_view(), name='group-files-manage'),
]
