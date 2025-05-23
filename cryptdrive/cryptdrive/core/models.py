from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    public_key = models.TextField(blank=True)
    quota = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.username}"


class File(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='files')
    filename = models.CharField(max_length=255)
    ciphertext_path = models.CharField(max_length=500)
    iv = models.TextField()
    size = models.BigIntegerField(null=True, blank=True)
    file_hash = models.CharField(max_length=128, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"File: {self.filename}"


class SharedKey(models.Model):
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name='shared_keys')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_keys')
    encrypted_sym_key = models.TextField()

    def __str__(self):
        return f"Share: {self.file.filename} -> {self.recipient.username}"


class Group(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_groups')
    name = models.CharField(max_length=255)
    members = models.ManyToManyField(
        User,
        related_name='member_groups',
        blank=True,
    )
    files = models.ManyToManyField(
        File,
        through='GroupFileShare',
        related_name='shared_to_groups',
        blank=True,
    )
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('owner', 'name')
        ordering = ['-created']

    def __str__(self):
        return f'{self.name} ({self.owner})'


class GroupFileShare(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    file = models.ForeignKey(File, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('group', 'file')
