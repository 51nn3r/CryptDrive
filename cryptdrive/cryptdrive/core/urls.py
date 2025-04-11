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
)

app_name = 'core'

urlpatterns = [
    path('csrf/', get_csrf_token, name='csrf'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('upload-public-key/', UploadPublicKeyView.as_view(), name='upload-pubkey'),
    path('has-public-key/', CheckPublicKeyView.as_view(), name='has-pubkey'),
    path('get-public-key/', GetPublicKeyView.as_view(), name='get-pubkey'),
    path('upload-encrypted/', UploadEncryptedFileView.as_view(), name='upload-encrypted'),
    path('files/', UserFileListView.as_view(), name='file-list'),
    path('download/<int:file_id>/meta/', FileMetaView.as_view(), name='file-download'),
    path('download/<int:file_id>/data/', FileEncryptedDataView.as_view(), name='file-download'),
]
