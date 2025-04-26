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
        # Check if API key is available
        if not settings.OPENAI_API_KEY:
            print("OpenAI API key is not set in settings")
            return Response(
                {"error": "OpenAI API key is not configured"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Initialize OpenAI client with fresh API key
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        
        message = request.data.get('message', '')
        conversation_id = request.data.get('conversation_id', str(uuid.uuid4()))

        # Get conversation history
        previous_messages = ChatMessage.objects.filter(
            conversation_id=conversation_id
        ).order_by('timestamp')

        # Build the messages array with system prompt and history
        messages = [
            {"role": "system", "content": """You are DocFinder AI, a medical assistant focused on quickly identifying symptoms and recommending appropriate specialists from our network. Follow these rules:

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

3. When recommending:
   - Briefly explain why that specialist is best suited
   - ALWAYS end with: "Would you like me to find a [EXACT SPECIALIST NAME] near you?"
   - Use the EXACT specialist names from the list above

4. DO NOT:
   - Give medical advice or diagnoses
   - Recommend specialists not on this list
   - Use generic terms like "GP" or "doctor"
   - Ask multiple questions
   - Be overly verbose"""}
        ]

        # Add conversation history
        for prev_message in previous_messages:
            messages.append({
                "role": prev_message.role,
                "content": prev_message.content
            })

        # Add the new user message
        messages.append({"role": "user", "content": message})

        # Save user message
        user_message = ChatMessage.objects.create(
            role='user',
            content=message,
            conversation_id=conversation_id
        )

        try:
            # Get response from OpenAI
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )
            
            bot_response = response.choices[0].message.content

            # Save bot response
            bot_message = ChatMessage.objects.create(
                role='assistant',
                content=bot_response,
                conversation_id=conversation_id
            )

            return Response({
                "response": bot_response,
                "conversation_id": conversation_id
            })

        except Exception as e:
            print(f"OpenAI API error: {str(e)}")
            return Response(
                {"error": "Failed to get response from OpenAI API"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    except Exception as e:
        print(f"General error in chat view: {str(e)}")
        return Response(
            {"error": "An unexpected error occurred"},
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