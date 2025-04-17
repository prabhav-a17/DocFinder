from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    email = models.EmailField(_('email address'), unique=True)
    phone_number = models.CharField(max_length=15, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    is_admin = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    password_reset_token = models.CharField(max_length=32, null=True, blank=True)
    password_reset_token_expires = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')

    def __str__(self):
        return self.username

class Appointment(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='appointments')
    doctor_name = models.CharField(max_length=255)
    doctor_place_id = models.CharField(max_length=255, null=True, blank=True)  # Google Places ID
    appointment_time = models.DateTimeField()
    reason = models.TextField()
    notification_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['appointment_time']

    def __str__(self):
        return f"{self.user.username}'s appointment with {self.doctor_name} at {self.appointment_time}"
