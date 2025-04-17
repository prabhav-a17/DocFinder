from django.urls import path
from .views import (
    UserRegistrationView,
    UserLoginView,
    PasswordResetRequestView,
    PasswordResetView,
    UserListView,
    UserDetailView,
    AppointmentListCreateView,
    AppointmentDetailView,
    upcoming_appointments
)

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', UserLoginView.as_view(), name='user-login'),
    path('password-reset-request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset/', PasswordResetView.as_view(), name='password-reset'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('appointments/', AppointmentListCreateView.as_view(), name='appointment-list-create'),
    path('appointments/<int:pk>/', AppointmentDetailView.as_view(), name='appointment-detail'),
    path('upcoming-appointments/', upcoming_appointments, name='upcoming-appointments'),
] 