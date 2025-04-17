from django.db import models
from django.conf import settings

class ChatMessage(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_messages')
    role = models.CharField(max_length=10)  # 'user' or 'assistant'
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_pinned = models.BooleanField(default=False)
    conversation_id = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.username} - {self.role} - {self.timestamp}" 