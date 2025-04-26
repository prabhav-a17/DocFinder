from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from django.utils.crypto import get_random_string
from django.utils import timezone
from datetime import timedelta
from .models import User, Appointment
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    PasswordResetRequestSerializer,
    PasswordResetSerializer,
    UserSerializer,
    AppointmentSerializer
)
from rest_framework.decorators import api_view, permission_classes
import logging

logger = logging.getLogger(__name__)

class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

class UserLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )
        
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )

class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            token = get_random_string(length=32)
            user.password_reset_token = token
            user.password_reset_token_expires = timezone.now() + timedelta(hours=1)
            user.save()
            
            reset_link = f"{settings.FRONTEND_URL}/reset-password/{token}"
            subject = 'Password Reset Request - DocFinder'
            html_content = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Hello {user.username},</h2>
                <p>We received a request to reset your password for your DocFinder account.</p>
                <p>Click the button below to reset your password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_link}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
                </div>
                <p style="color: #666;">This link will expire in 1 hour.</p>
                <p style="color: #666;">If you didn't request this password reset, you can safely ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #999; font-size: 12px;">Best regards,<br>The DocFinder Team</p>
            </div>
            """
            text_content = f"""
            Hello {user.username},

            We received a request to reset your password for your DocFinder account.
            Click the link below to reset your password:

            {reset_link}

            This link will expire in 1 hour.

            If you didn't request this password reset, you can safely ignore this email.

            Best regards,
            The DocFinder Team
            """
            try:
                send_mail(
                    subject=subject,
                    message=text_content,
                    html_message=html_content,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    fail_silently=False,
                )
                logger.info(f"Password reset email sent to {email}")
                return Response({'message': 'Password reset email sent'})
            except Exception as e:
                logger.error(f"Failed to send password reset email to {email}: {str(e)}")
                return Response({'error': f'Failed to send password reset email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except User.DoesNotExist:
            return Response(
                {'error': 'User with this email does not exist'},
                status=status.HTTP_404_NOT_FOUND
            )

class PasswordResetView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            user = User.objects.get(
                password_reset_token=serializer.validated_data['token'],
                password_reset_token_expires__gt=timezone.now()
            )
            user.set_password(serializer.validated_data['password'])
            user.password_reset_token = None
            user.password_reset_token_expires = None
            user.save()
            return Response({'message': 'Password reset successful'})
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid or expired token'},
                status=status.HTTP_400_BAD_REQUEST
            )

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class AppointmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        appointment = serializer.save(user=self.request.user)
        # Schedule notification email
        self.schedule_notification_email(appointment)

    def schedule_notification_email(self, appointment):
        notification_time = appointment.appointment_time - timedelta(hours=1)
        if notification_time > timezone.now():
            subject = 'Upcoming Appointment Reminder'
            html_content = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Appointment Reminder</h2>
                <p>Hello {appointment.user.username},</p>
                <p>This is a reminder that you have an appointment in 1 hour:</p>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
                    <p><strong>Doctor:</strong> {appointment.doctor_name}</p>
                    <p><strong>Time:</strong> {appointment.appointment_time.strftime('%B %d, %Y at %I:%M %p')}</p>
                    <p><strong>Reason:</strong> {appointment.reason}</p>
                </div>
                <p style="color: #666;">Please arrive a few minutes early for your appointment.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">Best regards,<br>The DocFinder Team</p>
            </div>
            """
            text_content = f"""
            Appointment Reminder

            Hello {appointment.user.username},

            This is a reminder that you have an appointment in 1 hour:

            Doctor: {appointment.doctor_name}
            Time: {appointment.appointment_time.strftime('%B %d, %Y at %I:%M %p')}
            Reason: {appointment.reason}

            Please arrive a few minutes early for your appointment.

            Best regards,
            The DocFinder Team
            """
            
            send_mail(
                subject=subject,
                message=text_content,
                html_message=html_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[appointment.user.email],
                fail_silently=False,
            )

class AppointmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(user=self.request.user)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def upcoming_appointments(request):
    now = timezone.now()
    appointments = Appointment.objects.filter(
        user=request.user,
        appointment_time__gt=now
    ).order_by('appointment_time')[:5]
    
    serializer = AppointmentSerializer(appointments, many=True)
    return Response(serializer.data) 