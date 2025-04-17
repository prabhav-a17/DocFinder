from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
import requests
from django.conf import settings
import logging
from math import radians, sin, cos, sqrt, atan2

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points using Haversine formula."""
    try:
        # Log input coordinates
        logger.debug(f"Calculating distance between: ({lat1}, {lon1}) and ({lat2}, {lon2})")
        
        # Convert coordinates from degrees to radians
        lat1, lon1, lat2, lon2 = map(float, [lat1, lon1, lat2, lon2])
        logger.debug(f"Converted to floats: ({lat1}, {lon1}) and ({lat2}, {lon2})")
        
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        logger.debug(f"Converted to radians: ({lat1}, {lon1}) and ({lat2}, {lon2})")

        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        # Radius of Earth in miles
        R = 3959
        distance = R * c
        
        rounded_distance = round(distance, 1)
        logger.debug(f"Calculated distance: {rounded_distance} miles")
        return rounded_distance
        
    except Exception as e:
        logger.error(f"Error calculating distance: {str(e)}")
        return None

@api_view(['POST'])
def find_doctor(request):
    """
    If the client POSTs `location: { lat, lng }`, we do a Nearby Search.
    If they POST `zip: "12345"`, we do a Text Search for "{specialist} in 12345".
    Neither call requires the Geocoding API.
    """
    specialist = request.data.get('query', '').strip()
    api_key = settings.GOOGLE_MAPS_API_KEY
    user_location = request.data.get('location', {})
    user_lat = user_location.get('lat')
    user_lng = user_location.get('lng')

    logger.info(f"Received search request for {specialist}")
    logger.info(f"User location: lat={user_lat}, lng={user_lng}")

    if not user_lat or not user_lng:
        logger.error("Missing location coordinates")
        return Response(
            {'error': 'Location coordinates are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Use Nearby Search with a larger radius
    url = (
        "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        f"?location={user_lat},{user_lng}"
        f"&radius=80000"  # 80km ~ 50 miles
        f"&type=doctor"
        f"&keyword={specialist}"
        f"&key={api_key}"
    )
    logger.info(f"Places NearbySearch URL: {url.replace(api_key, 'REDACTED')}")
    resp = requests.get(url)
    places = resp.json()

    # Handle the Places response
    status_code = places.get('status')
    logger.info(f"Places API returned status {status_code}")
    
    if status_code == 'OK':
        results = []
        for p in places.get('results', []):
            # Get location data for each place
            place_lat = p.get('geometry', {}).get('location', {}).get('lat')
            place_lng = p.get('geometry', {}).get('location', {}).get('lng')
            
            logger.debug(f"Processing place: {p.get('name')}")
            logger.debug(f"Place coordinates: lat={place_lat}, lng={place_lng}")
            
            # Only include results with valid coordinates
            if place_lat is not None and place_lng is not None:
                try:
                    distance = calculate_distance(
                        user_lat, user_lng,
                        place_lat, place_lng
                    )
                    
                    if distance is not None:
                        logger.info(f"Place: {p.get('name')}, Distance: {distance} miles")
                        
                        # Only include results within 50 miles
                        if distance <= 50:
                            results.append({
                                'name': p.get('name'),
                                'address': p.get('vicinity') or p.get('formatted_address'),
                                'description': f"Rating: {p.get('rating', 'N/A')} ⭐",
                                'rating': p.get('rating'),
                                'place_id': p.get('place_id'),
                                'distance': distance,
                                'opening_hours': p.get('opening_hours'),
                                'location': {
                                    'lat': place_lat,
                                    'lng': place_lng
                                }
                            })
                        else:
                            logger.debug(f"Skipping {p.get('name')} - too far ({distance} miles)")
                    else:
                        logger.warning(f"Could not calculate distance for {p.get('name')}")
                        
                except Exception as e:
                    logger.error(f"Error processing place {p.get('name')}: {str(e)}")
                    continue
            else:
                logger.warning(f"Missing coordinates for place: {p.get('name')}")

        # Log final results
        logger.info(f"Found {len(results)} results within 50 miles")
        results.sort(key=lambda x: x['distance'])
        return Response({'results': results})

    elif status_code == 'ZERO_RESULTS':
        logger.info("No results found")
        return Response({'results': []})

    else:
        logger.error(f"Places API error {status_code}: {places.get('error_message')}")
        return Response(
            {
                'error': status_code,
                'details': places.get('error_message')
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )