from django.urls import path
from . import views

urlpatterns = [
    path('chat/', views.chat, name='chat'),
    path('chat/pin/<int:message_id>/', views.toggle_pin, name='toggle_pin'),
    path('chat/pinned/', views.get_pinned_messages, name='get_pinned_messages'),
    path('chat/history/', views.get_chat_history, name='get_chat_history'),
    path('chat/history/delete/', views.delete_chat_history, name='delete_all_chat_history'),
    path('chat/history/delete/<str:conversation_id>/', views.delete_chat_history, name='delete_conversation'),
] 