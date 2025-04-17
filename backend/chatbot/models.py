from django.db import models
from users.models import User
from django.utils import timezone

class Conversation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_pinned = models.BooleanField(default=False)
    summary = models.TextField(blank=True)

    def __str__(self):
        return f"Conversation {self.id} - {self.user.username}"

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    content = models.TextField()
    is_user = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='chat_images/', null=True, blank=True)

    def __str__(self):
        return f"Message {self.id} - {'User' if self.is_user else 'Bot'}"

class ChatMessage(models.Model):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
        ('system', 'System'),
    ]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)
    conversation_id = models.CharField(max_length=50, blank=True, null=True)
    is_pinned = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.role}: {self.content[:50]}..."
