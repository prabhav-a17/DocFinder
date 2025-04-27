from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from .models import Appointment
from django.utils import timezone

def format_appointment_email(appointment):
    subject = 'Upcoming Appointment Reminder'
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Appointment Reminder</h2>
        <p>Hello {appointment.user.username},</p>
        <p>This is a reminder that you have an appointment soon:</p>
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

    This is a reminder that you have an appointment soon:

    Doctor: {appointment.doctor_name}
    Time: {appointment.appointment_time.strftime('%B %d, %Y at %I:%M %p')}
    Reason: {appointment.reason}

    Please arrive a few minutes early for your appointment.

    Best regards,
    The DocFinder Team
    """
    return subject, text_content, html_content

@shared_task
def send_appointment_reminder_email(appointment_id):
    try:
        appointment = Appointment.objects.get(id=appointment_id)
        if appointment.notification_sent:
            return 'Notification already sent.'
        subject, text_content, html_content = format_appointment_email(appointment)
        send_mail(
            subject=subject,
            message=text_content,
            html_message=html_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[appointment.user.email],
            fail_silently=False,
        )
        appointment.notification_sent = True
        appointment.save()
        return 'Notification sent.'
    except Appointment.DoesNotExist:
        return 'Appointment not found.'
    except Exception as e:
        return f'Error: {str(e)}' 