from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
from django.core.files.storage import default_storage
from openai import OpenAI
import os
from .models import ChatMessage
import uuid
from django.db.models import Max

client = OpenAI(api_key=settings.OPENAI_API_KEY)

@api_view(['GET'])
def get_chat_history(request):
    # Get unique conversation IDs and their latest message timestamp
    conversations = ChatMessage.objects.values('conversation_id').annotate(
        last_message=Max('timestamp')
    ).order_by('-last_message')

    chat_history = []
    for conv in conversations:
        messages = ChatMessage.objects.filter(
            conversation_id=conv['conversation_id']
        ).order_by('timestamp')
        
        if messages:
            chat_history.append({
                'conversation_id': conv['conversation_id'],
                'timestamp': conv['last_message'],
                'messages': [{
                    'id': msg.id,
                    'role': msg.role,
                    'content': msg.content,
                    'timestamp': msg.timestamp,
                    'is_pinned': msg.is_pinned
                } for msg in messages]
            })

    return Response(chat_history)

@api_view(['POST'])
def chat(request):
    try:
        message = request.data.get('message', '')
        conversation_id = request.data.get('conversation_id', str(uuid.uuid4()))

        # Save user message
        user_message = ChatMessage.objects.create(
            role='user',
            content=message,
            conversation_id=conversation_id
        )

        # Get conversation history
        messages = [
            {"role": "system", "content": "You are a helpful assistant that helps users find and understand documents."}
        ]
        
        # Add conversation history
        history = ChatMessage.objects.filter(conversation_id=conversation_id).order_by('timestamp')
        for msg in history:
            messages.append({"role": msg.role, "content": msg.content})

        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=1000,
            temperature=0.7,
        )

        assistant_message = response.choices[0].message.content

        # Save assistant message
        bot_message = ChatMessage.objects.create(
            role='assistant',
            content=assistant_message,
            conversation_id=conversation_id
        )

        return Response({
            'response': assistant_message,
            'conversation_id': conversation_id,
            'message_id': bot_message.id,
            'user_message_id': user_message.id
        })

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def toggle_pin(request, message_id):
    try:
        message = ChatMessage.objects.get(id=message_id)
        message.is_pinned = not message.is_pinned
        message.save()
        return Response({'is_pinned': message.is_pinned})
    except ChatMessage.DoesNotExist:
        return Response(
            {'error': 'Message not found'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
def get_pinned_messages(request):
    pinned_messages = ChatMessage.objects.filter(is_pinned=True).order_by('-timestamp')
    return Response([{
        'id': msg.id,
        'role': msg.role,
        'content': msg.content,
        'timestamp': msg.timestamp,
        'conversation_id': msg.conversation_id,
        'is_pinned': msg.is_pinned
    } for msg in pinned_messages])

@api_view(['DELETE'])
def delete_chat_history(request, conversation_id=None):
    try:
        if conversation_id:
            # Delete specific conversation
            ChatMessage.objects.filter(conversation_id=conversation_id).delete()
            return Response({'message': f'Conversation {conversation_id} deleted successfully'})
        else:
            # Delete all conversations
            ChatMessage.objects.all().delete()
            return Response({'message': 'All chat history deleted successfully'})
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 

from PIL import Image
import base64
from io import BytesIO

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_image(request):
    image = request.FILES.get('image')

    if not image:
        return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Convert image to base64
        img = Image.open(image)
        buffered = BytesIO()
        img.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

        # Build base64 data URL
        data_url = f"data:image/jpeg;base64,{img_str}"

        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Please describe this image."},
                        {"type": "image_url", "image_url": {"url": data_url}},
                    ],
                }
            ],
            max_tokens=300,
        )

        bot_message = response.choices[0].message.content

        return Response({
            'success': True,
            'response': bot_message
        })

    except Exception as e:
        print("UPLOAD ERROR:", str(e))
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)