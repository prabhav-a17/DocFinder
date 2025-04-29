from rest_framework import status
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.core.files.storage import default_storage
from openai import OpenAI
import os
from .models import ChatMessage, Conversation, Message
import uuid
from django.db.models import Max
from django.contrib.auth import get_user_model
import json
import traceback

client = OpenAI(api_key=settings.OPENAI_API_KEY)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_history(request, conversation_id=None):
    try:
        if conversation_id:
            # Get specific conversation
            try:
                conversation = Conversation.objects.get(
                    id=conversation_id,
                    user=request.user
                )
                messages = conversation.messages.all()
                chat_data = [{
                    'id': str(conversation.id),
                    'title': conversation.summary or messages[0].content[:50] if messages else "New Conversation",
                    'created_at': conversation.created_at,
                    'updated_at': conversation.updated_at,
                    'messages': [
                        {
                            'content': msg.content,
                            'role': 'user' if msg.is_user else 'assistant',
                            'created_at': msg.created_at
                        } for msg in messages
                    ]
                }]
            except Conversation.DoesNotExist:
                return Response({'error': 'Conversation not found'}, status=404)
        else:
            # Get all conversations
            conversations = Conversation.objects.filter(user=request.user)
            chat_data = []
            
            for conv in conversations:
                messages = conv.messages.all()
                chat_data.append({
                    'id': str(conv.id),
                    'title': conv.summary or messages[0].content[:50] if messages else "New Conversation",
                    'created_at': conv.created_at,
                    'updated_at': conv.updated_at,
                    'messages': [
                        {
                            'content': msg.content,
                            'role': 'user' if msg.is_user else 'assistant',
                            'created_at': msg.created_at
                        } for msg in messages
                    ]
                })
        
        return Response(chat_data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat(request):
    try:
        message = request.data.get('message')
        conversation_id = request.data.get('conversation_id')
        
        if not message:
            return Response({'error': 'Message is required'}, status=400)

        # Get or create conversation
        if conversation_id:
            try:
                conversation = Conversation.objects.get(
                    id=conversation_id,
                    user=request.user
                )
            except Conversation.DoesNotExist:
                return Response({'error': 'Invalid conversation ID'}, status=400)
        else:
            # Create new conversation
            conversation = Conversation.objects.create(
                user=request.user,
                summary=message[:50] + '...' if len(message) > 50 else message
            )

        # Save user message
        Message.objects.create(
            conversation=conversation,
            content=message,
            is_user=True
        )

        # Get previous messages for context
        previous_messages = conversation.messages.all().order_by('created_at')
        messages = [
            {"role": "system", "content": """You are DocFinder AI, a medical assistant focused on quickly identifying symptoms and recommending appropriate specialists from our network. Follow these rules STRICTLY:

1. BE CONCISE. Keep responses under 3 sentences unless absolutely necessary.
2. For symptom queries, ONLY recommend from this specific list of specialists:
   - Primary Care Physician (for general health issues, initial assessments)
   - Cardiologist (heart and blood vessel issues)
   - Dermatologist (skin conditions)
   - Endocrinologist (hormonal and metabolic disorders)
   - Gastroenterologist (digestive system)
   - Neurologist (brain and nervous system)
   - Obstetrician/Gynecologist (women's health)
   - Oncologist (cancer-related concerns)
   - Ophthalmologist (eye care)
   - Orthopedist (bones and joints)
   - Otolaryngologist (ENT) (ear, nose, throat issues)
   - Pediatrician (children's health)
   - Psychiatrist (mental health)
   - Pulmonologist (respiratory system)
   - Rheumatologist (autoimmune and joint diseases)
   - Urologist (urinary system)
   - Allergist/Immunologist (allergies and immune system)
   - Nephrologist (kidney diseases)
   - Hematologist (blood disorders)
   - Pain Management Specialist
   - Physical Medicine & Rehabilitation Specialist
   - Sports Medicine Specialist
   - Emergency Medicine Physician (urgent/emergency care)

3. When recommending a specialist:
   - ALWAYS end with: "Would you like me to find a [EXACT SPECIALIST NAME] near you?"
   - Use the EXACT specialist names from the list above
   - Briefly explain why that specialist is best suited
   - NEVER say you can't help find a specialist

4. DO NOT:
   - Give medical advice or diagnoses
   - Recommend specialists not on this list
   - Use generic terms like "GP" or "doctor"
   - Ask multiple questions
   - Be overly verbose
   - Say you can't help find a specialist
   - Suggest searching locally or getting referrals

5. If the user asks to find a specialist or says yes to finding one:
   - Confirm that you'll help them find the specialist
   - Use the exact format: "I'll help you find a [SPECIALIST NAME] near you."
   - Do not provide any other information or suggestions"""}
        ]

        # Add conversation history
        for prev_message in previous_messages:
            messages.append({
                "role": "user" if prev_message.is_user else "assistant",
                "content": prev_message.content
            })

        # Add the current message
        messages.append({"role": "user", "content": message})

        # Get response from OpenAI
        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=messages,
            max_tokens=300,
        )

        assistant_message = response.choices[0].message.content

        # Save assistant's response
        Message.objects.create(
            conversation=conversation,
            content=assistant_message,
            is_user=False
        )

        # Update conversation summary if it's the first message
        if conversation.messages.count() == 2:  # First user message + first assistant response
            conversation.summary = f"{message[:30]}... - {assistant_message[:30]}..."
            conversation.save()

        return Response({
            'response': assistant_message,
            'conversation_id': str(conversation.id)
        })

    except Exception as e:
        print("CHAT ERROR:", str(e))
        traceback.print_exc()
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_pin(request, message_id):
    try:
        message = Message.objects.get(id=message_id)
        message.conversation.is_pinned = not message.conversation.is_pinned
        message.conversation.save()
        return Response({'is_pinned': message.conversation.is_pinned})
    except Message.DoesNotExist:
        return Response(
            {'error': 'Message not found'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pinned_messages(request):
    pinned_conversations = Conversation.objects.filter(
        user=request.user,
        is_pinned=True
    ).order_by('-updated_at')
    
    return Response([{
        'id': conv.id,
        'summary': conv.summary,
        'created_at': conv.created_at,
        'updated_at': conv.updated_at,
        'messages': [{
            'content': msg.content,
            'is_user': msg.is_user,
            'created_at': msg.created_at
        } for msg in conv.messages.all()]
    } for conv in pinned_conversations])

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_chat_history(request, conversation_id=None):
    try:
        if conversation_id:
            # Delete specific conversation
            Conversation.objects.filter(
                id=conversation_id,
                user=request.user
            ).delete()
            return Response({'message': f'Conversation {conversation_id} deleted successfully'})
        else:
            # Delete all conversations
            Conversation.objects.filter(user=request.user).delete()
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
@permission_classes([IsAuthenticated])
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
            model="gpt-4-vision-preview",
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