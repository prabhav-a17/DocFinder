from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.decorators import login_required
from .models import ChatMessage
from .serializers import ChatMessageSerializer
import openai
import os
from datetime import datetime
import uuid

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat(request):
    if request.method == 'POST':
        message = request.data.get('message', '')
        conversation_id = request.data.get('conversation_id', str(uuid.uuid4()))

        # Save user message
        user_message = ChatMessage.objects.create(
            user=request.user,
            role='user',
            content=message,
            conversation_id=conversation_id
        )

        # Get AI response
        openai.api_key = os.getenv('OPENAI_API_KEY')
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": message}]
            )
            ai_response = response.choices[0].message.content

            # Save AI response
            ai_message = ChatMessage.objects.create(
                user=request.user,
                role='assistant',
                content=ai_response,
                conversation_id=conversation_id
            )

            return Response({
                'response': ai_response,
                'conversation_id': conversation_id
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_history(request):
    messages = ChatMessage.objects.filter(user=request.user).order_by('timestamp')
    serializer = ChatMessageSerializer(messages, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pinned_messages(request):
    messages = ChatMessage.objects.filter(user=request.user, is_pinned=True).order_by('-timestamp')
    serializer = ChatMessageSerializer(messages, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_pin_message(request, message_id):
    try:
        message = ChatMessage.objects.get(id=message_id, user=request.user)
        message.is_pinned = not message.is_pinned
        message.save()
        return Response({'status': 'success', 'is_pinned': message.is_pinned})
    except ChatMessage.DoesNotExist:
        return Response({'error': 'Message not found'}, status=404) 