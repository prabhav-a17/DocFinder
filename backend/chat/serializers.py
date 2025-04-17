from rest_framework import serializers
from .models import ChatMessage

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'content', 'timestamp', 'is_pinned', 'conversation_id']
        read_only_fields = ['id', 'timestamp'] 