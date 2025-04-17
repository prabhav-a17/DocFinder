declare namespace google.maps {
  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  class Geometry {
    location: LatLng;
  }

  namespace places {
    class Autocomplete {
      constructor(
        inputField: HTMLInputElement,
        opts?: AutocompleteOptions
      );
      addListener(eventName: string, handler: () => void): void;
      getPlace(): PlaceResult;
    }

    interface AutocompleteOptions {
      componentRestrictions?: {
        country: string | string[];
      };
      fields?: string[];
      types?: string[];
    }

    interface PlaceResult {
      formatted_address?: string;
      geometry?: {
        location: LatLng;
      };
    }
  }

  namespace event {
    function clearInstanceListeners(instance: any): void;
  }
}

interface Window {
  google: typeof google;
  initializeAutocomplete?: () => void;
} 