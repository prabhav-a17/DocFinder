import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { GOOGLE_MAPS_API_KEY, API_BASE_URL } from "../../config";
import "./FindDoctor.css";

// Icons as emojis
const ICONS = {
  SEARCH: "🔍",
  LOCATION: "📍",
  STAR: "⭐",
  CLOCK: "🕒",
  CLOSE: "×"
};

interface Doctor {
  name: string;
  address: string;
  description?: string;
  rating?: number;
  place_id?: string;
  distance?: number;
  opening_hours?: {
    open_now: boolean;
    weekday_text?: string[];
    periods?: {
      open: { day: number; time: string; };
      close: { day: number; time: string; };
    }[];
  };
}

interface Location {
  lat: number;
  lng: number;
}

interface Filters {
  distance: number;
  rating: number;
  openNow: boolean;
  nameSearch: string;
  dayOfWeek: number;
  selectedHours: string[];
  is24x7: boolean;
}

interface SortOption {
  field: 'distance' | 'rating' | 'name';
  direction: 'asc' | 'desc';
}

// Mapping of standardized terms to display names
const specialistDisplayNames: { [key: string]: string } = {
  "Primary Care": "Primary Care Physician",
  "Cardiology": "Cardiologist",
  "Dermatology": "Dermatologist",
  "Endocrinology": "Endocrinologist",
  "Gastroenterology": "Gastroenterologist",
  "Neurology": "Neurologist",
  "OBGYN": "Obstetrician/Gynecologist",
  "Oncology": "Oncologist",
  "Ophthalmology": "Ophthalmologist",
  "Orthopedics": "Orthopedist",
  "otolaryngologist-(ent)": "Otolaryngologist (ENT)",
  "Pediatrics": "Pediatrician",
  "Psychiatry": "Psychiatrist",
  "Pulmonology": "Pulmonologist",
  "Rheumatology": "Rheumatologist",
  "Urology": "Urologist",
  "Allergy": "Allergist",
  "Immunology": "Immunologist",
  "Nephrology": "Nephrologist",
  "Hematology": "Hematologist",
  "Pain Management": "Pain Management Specialist",
  "Physical Medicine": "Physical Medicine Specialist",
  "Rehabilitation": "Rehabilitation Specialist",
  "Plastic Surgery": "Plastic Surgeon",
  "Podiatry": "Podiatrist",
  "Sports Medicine": "Sports Medicine Specialist",
  "Vascular Surgery": "Vascular Surgeon",
  "Dental": "Dentist",
  "Chiropractic": "Chiropractor",
  "Emergency Medicine": "Emergency Medicine Physician"
};

const specialistTypes = [
  "Primary Care Physician",
  "Cardiologist", // Heart and blood vessels
  "Dermatologist", // Skin conditions
  "Endocrinologist", // Hormonal and metabolic disorders
  "Gastroenterologist", // Digestive system
  "Neurologist", // Brain and nervous system
  "Obstetrician/Gynecologist", // Women's health
  "Oncologist", // Cancer
  "Ophthalmologist", // Eye care
  "Orthopedist", // Bones and joints
  "Otolaryngologist (ENT)", // Ear, nose, and throat
  "Pediatrician", // Children's health
  "Psychiatrist", // Mental health
  "Pulmonologist", // Respiratory system
  "Rheumatologist", // Autoimmune and joint diseases
  "Urologist", // Urinary system
  "Allergist/Immunologist", // Allergies and immune system
  "Nephrologist", // Kidney diseases
  "Hematologist", // Blood disorders
  "Infectious Disease Specialist",
  "Pain Management Specialist",
  "Physical Medicine & Rehabilitation",
  "Plastic Surgeon",
  "Podiatrist", // Foot and ankle
  "Sports Medicine Specialist",
  "Vascular Surgeon",
  "Dentist",
  "Chiropractor",
  "Emergency Medicine Physician"
];

const distanceOptions = [5, 10, 20, 50];
const ratingOptions = [0, 3, 3.5, 4, 4.5];

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

const timeSlots = [
  { value: "09:00", label: "9:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "13:00", label: "1:00 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "15:00", label: "3:00 PM" },
  { value: "16:00", label: "4:00 PM" },
  { value: "17:00", label: "5:00 PM" },
  { value: "18:00", label: "6:00 PM" }
];

const FindDoctor: React.FC = () => {
  const token = localStorage.getItem('token');
  const { specialist } = useParams<{ specialist?: string }>();
  const navigate = useNavigate();
  const [address, setAddress] = useState<string>("");
  const [results, setResults] = useState<Doctor[]>([]);
  const [filteredResults, setFilteredResults] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [usingLocation, setUsingLocation] = useState<boolean>(false);
  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  const [selectedPlace, setSelectedPlace] = useState<{
    address: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  
  const [filters, setFilters] = useState<Filters>({
    distance: 50,
    rating: 0,
    openNow: false,
    nameSearch: "",
    dayOfWeek: new Date().getDay(),
    selectedHours: [],
    is24x7: false
  });
  
  const [sortOption, setSortOption] = useState<SortOption>({
    field: 'distance',
    direction: 'asc'
  });

  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");

  useEffect(() => {
    if (specialist) {
      const displayName = specialistDisplayNames[specialist] || specialist;
      setSelectedSpecialty(displayName);
      // Only trigger search if we have a location
      if (selectedPlace || usingLocation) {
        handleSearch(displayName);
      }
    }
  }, [specialist, selectedPlace, usingLocation]);

  // Initialize Google Maps script
  useEffect(() => {
    // Check if script is already loaded
    if (window.google) {
      setScriptLoaded(true);
      return;
    }

    // Only load script if not already loaded
    if (!scriptLoaded) {
      // Define the callback function
      window.initializeAutocomplete = () => {
        setScriptLoaded(true);
      };

      // Create and append the script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initializeAutocomplete`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      // Cleanup
      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
        if (window.initializeAutocomplete) {
          delete window.initializeAutocomplete;
        }
      };
    }
  }, []); // Empty dependency array since this should only run once on mount

  // Initialize autocomplete after script is loaded
  useEffect(() => {
    let autocomplete: google.maps.places.Autocomplete | null = null;

    if (scriptLoaded && autocompleteInputRef.current) {
      try {
        autocomplete = new window.google.maps.places.Autocomplete(
          autocompleteInputRef.current,
          {
            componentRestrictions: { country: "us" },
            fields: ["formatted_address", "geometry"],
            types: ["address"]
          }
        );

        const handlePlaceChanged = () => {
          const place = autocomplete?.getPlace();
          if (place?.geometry?.location) {
            setSelectedPlace({
              address: place.formatted_address || "",
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            });
            setAddress(place.formatted_address || "");
          }
        };

        autocomplete.addListener("place_changed", handlePlaceChanged);
      } catch (error) {
        console.error("Error initializing autocomplete:", error);
      }
    }

    // Cleanup function to remove event listeners
    return () => {
      if (autocomplete) {
        google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [scriptLoaded]); // Only depend on scriptLoaded state

  useEffect(() => {
    if (!token) {
      navigate('/login', { state: { from: '/find-doctor' } });
      return;
    }
  }, [token, navigate]);

  useEffect(() => {
    let filtered = [...results];

    // Apply distance filter first
    if (filters.distance < 50) {  // Only filter if not at max distance
      filtered = filtered.filter(doctor => {
        // Ensure we have a valid number for distance
        const distance = typeof doctor.distance === 'number' && !isNaN(doctor.distance)
          ? doctor.distance
          : Infinity;
        return distance <= filters.distance;
      });
    }

    // Apply other filters
    if (filters.nameSearch) {
      filtered = filtered.filter(doctor => 
        doctor.name.toLowerCase().includes(filters.nameSearch.toLowerCase())
      );
    }

    if (filters.rating > 0) {
      filtered = filtered.filter(doctor => 
        (doctor.rating || 0) >= filters.rating
      );
    }

    if (filters.is24x7) {
      filtered = filtered.filter(doctor => {
        if (!doctor.opening_hours?.periods) return false;
        
        return doctor.opening_hours.periods.some(period => 
          period.open.time === '0000' && period.close.time === '2359'
        );
      });
    } else if (filters.openNow) {
      filtered = filtered.filter(doctor => 
        doctor.opening_hours?.open_now === true
      );
    } else if (filters.dayOfWeek !== -1 && filters.selectedHours.length > 0) {
      filtered = filtered.filter(doctor => {
        if (!doctor.opening_hours?.periods) return true;
        
        const dayPeriods = doctor.opening_hours.periods.filter(
          period => period.open.day === filters.dayOfWeek
        );

        return filters.selectedHours.some(selectedTime => {
          const selectedTimeNum = parseInt(selectedTime.replace(':', ''));
          return dayPeriods.some(period => {
            const openTime = parseInt(period.open.time);
            const closeTime = parseInt(period.close.time);
            return selectedTimeNum >= openTime && selectedTimeNum < closeTime;
          });
        });
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOption.field) {
        case 'distance':
          // Ensure we're comparing valid numbers for distance
          const aDistance = typeof a.distance === 'number' && !isNaN(a.distance)
            ? a.distance
            : Infinity;
          const bDistance = typeof b.distance === 'number' && !isNaN(b.distance)
            ? b.distance
            : Infinity;
          return sortOption.direction === 'asc' 
            ? aDistance - bDistance
            : bDistance - aDistance;
        case 'rating':
          const aRating = typeof a.rating === 'number' ? a.rating : 0;
          const bRating = typeof b.rating === 'number' ? b.rating : 0;
          return sortOption.direction === 'asc'
            ? aRating - bRating
            : bRating - aRating;
        case 'name':
          return sortOption.direction === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    setFilteredResults(filtered);
  }, [results, filters, sortOption]);

  const getCurrentLocation = () => {
    if (!token) {
      setError("Please log in to search for doctors");
      setIsLoading(false);
      navigate('/login', { state: { from: `/find-doctor/${specialist || ''}` } });
      return;
    }

    setError("");
    setIsLoading(true);
    setUsingLocation(true);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await axios.post(`${API_BASE_URL}/clinic-finder/find-doctor/`, {
            query: selectedSpecialty,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (res.data.results) {
            const processedResults = res.data.results.map((result: Partial<Doctor>) => ({
              ...result,
              distance: typeof result.distance === 'number' && !isNaN(result.distance)
                ? Number(result.distance)
                : Infinity
            }));
            setResults(processedResults);
            setFilteredResults(processedResults);
          } else {
            setResults([]);
            setFilteredResults([]);
            setError("No results found in your area. Please try a different location.");
          }
        } catch (err: any) {
          console.error("Error:", err.response?.data || err.message);
          if (err.response?.status === 401) {
            setError("Your session has expired. Please log in again.");
            localStorage.removeItem('token');
            navigate('/login', { state: { from: `/find-doctor/${specialist || ''}` } });
          } else {
            setError(err.response?.data?.error || "Failed to fetch doctors. Please try again.");
          }
        } finally {
          setIsLoading(false);
          setUsingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setError("Unable to retrieve your location. Please ensure location access is enabled in your browser settings.");
        setIsLoading(false);
        setUsingLocation(false);
      }
    );
  };

  const handleSearchResults = (data: any) => {
    if (data.results) {
      const processedResults = data.results.map((result: Partial<Doctor>) => ({
        ...result,
        distance: typeof result.distance === 'number' && !isNaN(result.distance)
          ? Number(result.distance)
          : Infinity
      }));
      setResults(processedResults);
      setFilteredResults(processedResults);
    } else {
      setResults([]);
      setFilteredResults([]);
      setError("No results found. Please try a different location.");
    }
    setIsLoading(false);
  };

  const handleSearchError = (err: any) => {
    console.error('Search error:', err);
    if (err.response?.status === 401) {
      setError("Your session has expired. Please log in again.");
      localStorage.removeItem('token');
      navigate('/login', { state: { from: `/find-doctor/${specialist || ''}` } });
    } else {
      setError("Failed to fetch doctors. Please try again.");
    }
    setIsLoading(false);
  };

  const handleSearch = async (specialtyOverride?: string) => {
    setError('');
    setIsLoading(true);
    setResults([]);
    setFilteredResults([]);

    const searchSpecialty = specialtyOverride || selectedSpecialty;

    if (usingLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const res = await axios.post(`${API_BASE_URL}/clinic-finder/find-doctor/`, {
                query: searchSpecialty,
                location: {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
                }
              });
              handleSearchResults(res.data);
            } catch (err) {
              handleSearchError(err);
            }
          },
          (err) => {
            setError('Error getting your location. Please enter an address.');
            setIsLoading(false);
          }
        );
      } else {
        setError('Geolocation is not supported by your browser');
        setIsLoading(false);
      }
    } else if (selectedPlace) {
      try {
        const res = await axios.post(
          `${API_BASE_URL}/clinic-finder/find-doctor/`,
          {
            query: searchSpecialty,
            location: {
              lat: selectedPlace.lat,
              lng: selectedPlace.lng
            }
          }
        );
        handleSearchResults(res.data);
      } catch (err) {
        handleSearchError(err);
      }
    } else {
      setError('Please enter a location or use your current location');
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSearch();
  };

  const handleSpecialistChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSpecialist = e.target.value.toLowerCase().replace(/ /g, '-');
    navigate(`/find-doctor/${newSpecialist}`);
  };

  const handleFilterChange = (filterName: keyof Filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleSortChange = (field: SortOption['field']) => {
    setSortOption(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearFilters = () => {
    setFilters({
      distance: 50,
      rating: 0,
      openNow: false,
      nameSearch: "",
      dayOfWeek: new Date().getDay(),
      selectedHours: [],
      is24x7: false
    });
    setSortOption({
      field: 'distance',
      direction: 'asc'
    });
  };

  const handleHourToggle = (hour: string) => {
    setFilters(prev => ({
      ...prev,
      selectedHours: prev.selectedHours.includes(hour)
        ? prev.selectedHours.filter(h => h !== hour)
        : [...prev.selectedHours, hour].sort()
    }));
  };

  return (
    <div className="find-doctor-container">
      <div className="find-doctor-header">
        <h1>Find a</h1>
        <div className="specialist-select-container">
          <select 
            value={selectedSpecialty.toLowerCase().replace(/ /g, '-')} 
            onChange={handleSpecialistChange}
            aria-label="Select specialist type"
          >
            {specialistTypes.map(type => (
              <option 
                key={type} 
                value={type.toLowerCase().replace(/ /g, '-')}
              >
                {type}
              </option>
            ))}
          </select>
        </div>
        <p>Enter your address or use your current location to find local {selectedSpecialty.toLowerCase()} near you.</p>
      </div>

      <div className="find-doctor-body">
        {/* Sidebar column */}
        <aside className="filter-section">
          <div className="filter-header">
            <h3>Filter Results</h3>
            <button 
              onClick={clearFilters}
              className="clear-filters-button"
            >
              Clear All Filters
            </button>
          </div>

          <div className="filters-container">
            {/* Name Search */}
            <div className="filter-group">
              <label>Search by Name</label>
              <input
                type="text"
                value={filters.nameSearch}
                onChange={(e) => handleFilterChange('nameSearch', e.target.value)}
                placeholder="Enter doctor name..."
                className="filter-select"
              />
            </div>

            {/* Distance Filter */}
            <div className="filter-group">
              <label>Distance</label>
              <select
                value={filters.distance}
                onChange={(e) => handleFilterChange('distance', Number(e.target.value))}
                className="filter-select"
              >
                {distanceOptions.map(dist => (
                  <option key={dist} value={dist}>Within {dist} miles</option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div className="filter-group">
              <label>Minimum Rating</label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', Number(e.target.value))}
                className="filter-select"
              >
                {ratingOptions.map(rating => (
                  <option key={rating} value={rating}>
                    {rating === 0 ? 'Any Rating' : `${rating}★ or higher`}
                  </option>
                ))}
              </select>
            </div>

            {/* Hours Filter */}
            <div className="filter-group hours-filter">
              <label>Hours</label>
              <div className="hours-inputs">
                <select
                  value={filters.dayOfWeek}
                  onChange={(e) => handleFilterChange('dayOfWeek', Number(e.target.value))}
                  className="filter-select"
                  disabled={filters.openNow || filters.is24x7}
                >
                  {daysOfWeek.map((day, index) => (
                    <option key={day} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
                <div className="time-slots-container">
                  {timeSlots.map((slot) => (
                    <label key={slot.value} className={`time-slot-label ${filters.openNow || filters.is24x7 ? 'disabled' : ''}`}>
                      <input
                        type="checkbox"
                        checked={filters.selectedHours.includes(slot.value)}
                        onChange={() => handleHourToggle(slot.value)}
                        disabled={filters.openNow || filters.is24x7}
                        className="time-slot-checkbox"
                      />
                      <span>{slot.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.is24x7}
                  onChange={(e) => {
                    handleFilterChange('is24x7', e.target.checked);
                    if (e.target.checked) {
                      handleFilterChange('openNow', false);
                      handleFilterChange('dayOfWeek', -1);
                      handleFilterChange('selectedHours', []);
                    }
                  }}
                  className="filter-checkbox"
                />
                24/7 Only
              </label>
            </div>

            {/* Open Now Toggle */}
            <div className="filter-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.openNow}
                  onChange={(e) => {
                    handleFilterChange('openNow', e.target.checked);
                    if (e.target.checked) {
                      handleFilterChange('is24x7', false);
                      handleFilterChange('dayOfWeek', -1);
                      handleFilterChange('selectedHours', []);
                    } else {
                      handleFilterChange('dayOfWeek', new Date().getDay());
                      handleFilterChange('selectedHours', []);
                    }
                  }}
                  className="filter-checkbox"
                  disabled={filters.is24x7}
                />
                Open Now
              </label>
            </div>
          </div>

          {/* Active Filters Display */}
          <div className="active-filters">
            {filters.nameSearch && (
              <span className="filter-tag">
                Name: {filters.nameSearch}
                <button onClick={() => handleFilterChange('nameSearch', '')}>
                  {ICONS.CLOSE}
                </button>
              </span>
            )}
            {filters.rating > 0 && (
              <span className="filter-tag">
                Rating: ≥{filters.rating}★
                <button onClick={() => handleFilterChange('rating', 0)}>
                  {ICONS.CLOSE}
                </button>
              </span>
            )}
            {filters.is24x7 && (
              <span className="filter-tag">
                24/7 Only
                <button onClick={() => handleFilterChange('is24x7', false)}>
                  {ICONS.CLOSE}
                </button>
              </span>
            )}
            {!filters.openNow && !filters.is24x7 && filters.dayOfWeek !== -1 && filters.selectedHours.length > 0 && (
              <span className="filter-tag">
                Open: {daysOfWeek[filters.dayOfWeek]} at {filters.selectedHours.map(h => 
                  timeSlots.find(slot => slot.value === h)?.label
                ).join(', ')}
                <button onClick={() => {
                  handleFilterChange('dayOfWeek', -1);
                  handleFilterChange('selectedHours', []);
                }}>
                  {ICONS.CLOSE}
                </button>
              </span>
            )}
            {filters.openNow && (
              <span className="filter-tag">
                Open Now
                <button onClick={() => handleFilterChange('openNow', false)}>
                  {ICONS.CLOSE}
                </button>
              </span>
            )}
          </div>
        </aside>

        {/* Main content column */}
        <main className="content-section">
          <form onSubmit={handleFormSubmit} className="find-doctor-form">
            <input
              ref={autocompleteInputRef}
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your address..."
              className="find-doctor-input"
              required={!usingLocation}
              disabled={usingLocation}
            />
            <button 
              type="submit" 
              className="find-doctor-button primary"
              disabled={usingLocation}
            >
              {ICONS.SEARCH} Search
            </button>
            <button 
              type="button" 
              className="find-doctor-button secondary"
              onClick={getCurrentLocation}
              disabled={usingLocation}
            >
              {ICONS.LOCATION} {usingLocation ? "Getting Location..." : "Use Current Location"}
            </button>
          </form>

          {isLoading && <div className="loading">Loading results...</div>}

          {/* Sort Section */}
          {filteredResults.length > 0 && (
            <div className="sort-section">
              <span className="sort-label">Sort by:</span>
              <div className="sort-buttons">
                <button
                  className={`sort-button ${sortOption.field === 'distance' ? 'active' : ''}`}
                  onClick={() => handleSortChange('distance')}
                >
                  Distance
                  {sortOption.field === 'distance' && (
                    <span className="sort-direction">
                      {sortOption.direction === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </button>
                <button
                  className={`sort-button ${sortOption.field === 'rating' ? 'active' : ''}`}
                  onClick={() => handleSortChange('rating')}
                >
                  Rating
                  {sortOption.field === 'rating' && (
                    <span className="sort-direction">
                      {sortOption.direction === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </button>
                <button
                  className={`sort-button ${sortOption.field === 'name' ? 'active' : ''}`}
                  onClick={() => handleSortChange('name')}
                >
                  Name
                  {sortOption.field === 'name' && (
                    <span className="sort-direction">
                      {sortOption.direction === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="find-doctor-results">
            {filteredResults.length > 0 ? (
              filteredResults.map((doctor, index) => (
                <div key={index} className="doctor-card">
                  <h3 className="doctor-name">{doctor.name}</h3>
                  <p className="doctor-address">
                    {ICONS.LOCATION}{" "}
                    <a
                      href={`https://www.google.com/maps/place/?q=place_id:${doctor.place_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {doctor.address}
                    </a>
                  </p>
                  <div className="doctor-details">
                    {doctor.rating && (
                      <span className="doctor-rating">
                        {ICONS.STAR} {doctor.rating.toFixed(1)}
                      </span>
                    )}
                    {typeof doctor.distance === 'number' && !isNaN(doctor.distance) && (
                      <span className="doctor-distance">
                        {ICONS.LOCATION} {doctor.distance.toFixed(1)} miles
                      </span>
                    )}
                    {doctor.opening_hours && (
                      <span className={`doctor-status ${doctor.opening_hours.open_now ? 'open' : 'closed'}`}>
                        {ICONS.CLOCK} {doctor.opening_hours.open_now ? 'Open Now' : 'Closed'}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              !isLoading && <p className="no-results">No results found with current filters. Try adjusting your search criteria.</p>
            )}
          </div>

          {error && <p className="find-doctor-error">{error}</p>}
        </main>
      </div>
    </div>
  );
};

export default FindDoctor; 