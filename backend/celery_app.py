import os
from celery import Celery
from dotenv import load_dotenv  # 👈 Add this

load_dotenv()  # 👈 Load .env file BEFORE Celery reads Django settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'docfinder.settings')

app = Celery('docfinder')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()