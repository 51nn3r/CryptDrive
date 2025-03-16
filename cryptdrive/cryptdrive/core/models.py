from django.db import models

class User(models.Model):
    is_admin = models.BooleanField(default=False)
    username = models.CharField(max_length=150, unique=True)
    password_hash = models.CharField(max_length=255)
    public_key = models.TextField(blank=True)

    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('user', 'User'),
    )
    role = models.CharField(max_length=5, choices=ROLE_CHOICES, default='user')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username}"

class File(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='files')
    filename = models.CharField(max_length=255)
    ciphertext_path = models.CharField(max_length=500)
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
