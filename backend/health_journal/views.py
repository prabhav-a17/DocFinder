from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import HealthLog
from .serializers import HealthLogSerializer
import logging
from django.core.exceptions import PermissionDenied

logger = logging.getLogger(__name__)

class HealthLogViewSet(viewsets.ModelViewSet):
    serializer_class = HealthLogSerializer
    permission_classes = [permissions.IsAuthenticated]  # Require authentication

    def get_queryset(self):
        try:
            # Return only logs belonging to the authenticated user
            return HealthLog.objects.filter(user=self.request.user).order_by('-created_at')
        except Exception as e:
            logger.error(f"Error fetching health logs: {str(e)}")
            return HealthLog.objects.none()

    def perform_create(self, serializer):
        try:
            # Save the log with the authenticated user
            serializer.save(user=self.request.user)
        except Exception as e:
            logger.error(f"Error creating health log: {str(e)}")
            raise

    def perform_update(self, serializer):
        try:
            # Ensure the user owns this log
            if serializer.instance.user != self.request.user:
                raise PermissionDenied("You don't have permission to modify this log.")
            serializer.save()
        except Exception as e:
            logger.error(f"Error updating health log: {str(e)}")
            raise

    def perform_destroy(self, instance):
        try:
            # Ensure the user owns this log
            if instance.user != self.request.user:
                raise PermissionDenied("You don't have permission to delete this log.")
            instance.delete()
        except Exception as e:
            logger.error(f"Error deleting health log: {str(e)}")
            raise 