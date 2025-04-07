from abc import ABC, abstractmethod
from .models import HealthcareProvider

class HealthcareProviderFactory(ABC):
    @abstractmethod
    def create_provider(self, **kwargs):
        pass

class ClinicFactory(HealthcareProviderFactory):
    def create_provider(self, **kwargs):
        return HealthcareProvider.objects.create(
            is_clinic=True,
            **kwargs
        )

class HospitalFactory(HealthcareProviderFactory):
    def create_provider(self, **kwargs):
        return HealthcareProvider.objects.create(
            is_hospital=True,
            **kwargs
        )

class PrivatePracticeFactory(HealthcareProviderFactory):
    def create_provider(self, **kwargs):
        return HealthcareProvider.objects.create(
            is_private_practice=True,
            **kwargs
        )

def get_provider_factory(provider_type):
    factories = {
        'clinic': ClinicFactory(),
        'hospital': HospitalFactory(),
        'private_practice': PrivatePracticeFactory()
    }
    return factories.get(provider_type.lower()) 