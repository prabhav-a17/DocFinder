from django.urls import path
from . import views

urlpatterns = [
    path('chat/', views.chat, name='chat'),
    path('upload-image/', views.upload_image, name='upload_image'),
] 