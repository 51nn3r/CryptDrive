import os

import uuid

from django.conf import settings
from django.db import transaction

from .models import File, SharedKey


def save_public_key(user, public_key_b64):
    user.public_key = public_key_b64
    user.save()


def user_has_public_key(user):
    return bool(user.public_key)


def get_public_key(user):
    return user.public_key


@transaction.atomic
def save_encrypted_file(user, filename, encrypted_file, iv):
    file_obj = File.objects.create(
        owner=user,
        filename=filename,
        iv=iv,
        size=len(encrypted_file),
    )

    path = os.path.join('encrypted_uploads', f'{user.id}_{file_obj.id}_{filename}_{uuid.uuid4()}')
    full_path = os.path.join(settings.MEDIA_ROOT, path)

    with open(full_path, 'wb') as file:
        for chunk in encrypted_file.chunks():
            file.write(chunk)

    file_obj.ciphertext_path = path
    file_obj.save()

    return file_obj


def save_shared_key(file_obj, recipient, encrypted_sym_key):
    shared_key = SharedKey.objects.create(
        file=file_obj,
        recipient=recipient,
        encrypted_sym_key=encrypted_sym_key
    )
    return shared_key
