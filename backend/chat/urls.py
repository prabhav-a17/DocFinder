from django.urls import path
from . import views

urlpatterns = [
    path('', views.chat, name='chat'),
    path('history/', views.get_chat_history, name='chat_history'),
    path('pinned/', views.get_pinned_messages, name='pinned_messages'),
    path('pin/<int:message_id>/', views.toggle_pin_message, name='toggle_pin'),
] 