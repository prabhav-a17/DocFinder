from django.db import models
from users.models import User

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
