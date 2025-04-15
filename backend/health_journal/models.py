from django.db import models
from users.models import User
from django.contrib.auth import get_user_model

User = get_user_model()

# Create your models here.

class DoctorVisit(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    doctor_name = models.CharField(max_length=255)
    clinic_name = models.CharField(max_length=255)
    visit_date = models.DateTimeField()
    next_appointment = models.DateTimeField(null=True, blank=True)
    notes = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.doctor_name} - {self.visit_date.strftime('%Y-%m-%d')}"

class HealthNote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class HealthLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='health_logs', null=True, blank=True)
    clinic_name = models.CharField(max_length=255)
    rating = models.IntegerField(default=0)
    thoughts = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.clinic_name} - {self.created_at.strftime('%Y-%m-%d')}"
