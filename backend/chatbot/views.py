from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
from openai import OpenAI
import os
from .models import ChatMessage
import uuid

client = OpenAI(api_key=settings.OPENAI_API_KEY)

@api_view(['POST'])
def chat(request):
    try:
        message = request.data.get('message', '')
        conversation_id = request.data.get('conversation_id', str(uuid.uuid4()))

        # Save user message
        ChatMessage.objects.create(
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
        ChatMessage.objects.create(
            role='assistant',
            content=assistant_message,
            conversation_id=conversation_id
        )

        return Response({
            'response': assistant_message,
            'conversation_id': conversation_id
        })

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 