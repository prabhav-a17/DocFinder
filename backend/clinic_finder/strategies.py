from abc import ABC, abstractmethod
from .models import HealthcareProvider

class SearchStrategy(ABC):
    @abstractmethod
    def search(self, queryset, **kwargs):
        pass

class DistanceSearchStrategy(SearchStrategy):
    def search(self, queryset, latitude, longitude, max_distance):
        # This is a simplified version. In production, you'd use a proper geospatial query
        return queryset.filter(
            latitude__range=(latitude - max_distance, latitude + max_distance),
            longitude__range=(longitude - max_distance, longitude + max_distance)
        )

class RatingSearchStrategy(SearchStrategy):
    def search(self, queryset, min_rating):
        return queryset.filter(rating__gte=min_rating)

class SpecializationSearchStrategy(SearchStrategy):
    def search(self, queryset, specialization_id):
        return queryset.filter(specialization_id=specialization_id)

class AvailabilitySearchStrategy(SearchStrategy):
    def search(self, queryset, day, time):
        return queryset.filter(
            operating_hours__day=day,
            operating_hours__opening_time__lte=time,
            operating_hours__closing_time__gte=time,
            operating_hours__is_closed=False
        )

class SearchContext:
    def __init__(self, strategy: SearchStrategy):
        self._strategy = strategy

    def set_strategy(self, strategy: SearchStrategy):
        self._strategy = strategy

    def execute_search(self, queryset, **kwargs):
        return self._strategy.search(queryset, **kwargs) 