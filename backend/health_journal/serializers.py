from rest_framework import serializers
from .models import HealthLog

class HealthLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthLog
        fields = ['id', 'clinic_name', 'rating', 'thoughts', 'created_at', 'updated_at', 'user']
        read_only_fields = ['id', 'created_at', 'updated_at', 'user'] 