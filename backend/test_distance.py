import requests
import json

def test_doctor_search():
    # Test coordinates for Atlanta, GA
    url = "http://localhost:8001/api/clinic-finder/find-doctor/"
    payload = {
        "query": "General Physician",
        "location": {
            "lat": 33.7490,
            "lng": -84.3880
        }
    }
    
    print("Sending request with payload:", json.dumps(payload, indent=2))
    
    response = requests.post(url, json=payload)
    
    print("\nResponse status:", response.status_code)
    
    if response.status_code == 200:
        data = response.json()
        print("\nFound", len(data.get('results', [])), "results")
        
        # Print the first 5 results with their distances
        print("\nFirst 5 results:")
        for i, result in enumerate(data.get('results', [])[:5], 1):
            print(f"\n{i}. {result['name']}")
            print(f"   Address: {result['address']}")
            print(f"   Distance: {result.get('distance')} miles")
            if 'location' in result:
                print(f"   Coordinates: lat={result['location']['lat']}, lng={result['location']['lng']}")
    else:
        print("\nError:", response.text)

if __name__ == "__main__":
    test_doctor_search() 