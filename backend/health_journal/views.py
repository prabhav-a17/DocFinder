from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .models import HealthLog
from .serializers import HealthLogSerializer

class HealthLogViewSet(viewsets.ModelViewSet):
    serializer_class = HealthLogSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily allow all access

    def get_queryset(self):
        # For testing, return all logs
        return HealthLog.objects.all()

    def perform_create(self, serializer):
        # For testing, save without user
        serializer.save() 