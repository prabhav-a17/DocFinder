from django.urls import path
from . import views

urlpatterns = [
    path('find-doctor/', views.find_doctor, name='find-doctor'),
] 