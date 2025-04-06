from django.conf import settings
import os
from .models import File, SharedKey

def save_public_key(user, public_key_b64):
    user.public_key = public_key_b64
    user.save()

def user_has_public_key(user):
    return bool(user.public_key)

def get_public_key(user):
    return user.public_key

def save_encrypted_file(user, filename, encrypted_data_b64):
    path = os.path.join('encrypted_uploads', f'{user.id}_{filename}')
    full_path = os.path.join(settings.MEDIA_ROOT, path)

    with open(full_path, 'wb') as f:
        f.write(encrypted_data_b64.encode())

    file_obj = File.objects.create(
        owner=user,
        filename=filename,
        ciphertext_path=path,
    )
    return file_obj

def save_shared_key(file_obj, recipient, encrypted_sym_key):
    shared_key = SharedKey.objects.create(
        file=file_obj,
        recipient=recipient,
        encrypted_sym_key=encrypted_sym_key
    )
    return shared_key
