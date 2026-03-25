// export const GOOGLE_MAPS_LIBRARIES: ("places")[] = ["places"];

// export const getLatLngFromPlace = (place: google.maps.places.PlaceResult) => {
//   if (!place.geometry || !place.geometry.location) {
//     return { lat: "", lng: "" };
//   }

//   return {
//     lat: place.geometry.location.lat().toString(),
//     lng: place.geometry.location.lng().toString(),
//   };
// };

// export const getDetailsFromNewPlace = async (place: google.maps.places.Place) => {
//   // New API requires explicit field fetching
//   await place.fetchFields({
//     fields: ["location", "formattedAddress", "displayName"],
//   });

//   return {
//     lat: place.location?.lat().toString() || "",
//     lng: place.location?.lng().toString() || "",
//     address: place.formattedAddress || "",
//     name: place.displayName || "",
//   };
// };

/**
 * Google Maps Places API Utilities
 * Handles location search, geocoding, and coordinate extraction
 */

export const GOOGLE_MAPS_LIBRARIES: "places"[] = ["places"];

/**
 * Interface for coordinates returned from Google Places
 */
export interface Coordinates {
  lat: string;
  lng: string;
}

/**
 * Interface for location details
 */
export interface LocationDetails extends Coordinates {
  address: string;
  name?: string;
}

/**
 * Extract latitude and longitude from a PlaceResult
 * Used with Autocomplete component
 */
export const getLatLngFromPlace = (
  place: google.maps.places.PlaceResult,
): Coordinates => {
  try {
    if (!place?.geometry?.location) {
      console.warn("Place has no valid geometry or location");
      return { lat: "", lng: "" };
    }

    return {
      lat: place.geometry.location.lat().toString(),
      lng: place.geometry.location.lng().toString(),
    };
  } catch (error) {
    console.error("Error extracting lat/lng from place:", error);
    return { lat: "", lng: "" };
  }
};

/**
 * Extract full location details from a PlaceResult
 * Includes coordinates, formatted address, and place name
 */
export const getLocationDetailsFromPlace = (
  place: google.maps.places.PlaceResult,
): LocationDetails => {
  try {
    const { lat, lng } = getLatLngFromPlace(place);

    return {
      lat,
      lng,
      address: place.formatted_address || place.name || "",
      name: place.name,
    };
  } catch (error) {
    console.error("Error extracting location details from place:", error);
    return { lat: "", lng: "", address: "" };
  }
};

/**
 * Extract location details from the new Google Places API format
 * Requires explicit field fetching for the new API version
 */
export const getDetailsFromNewPlace = async (
  place: google.maps.places.Place,
): Promise<LocationDetails> => {
  try {
    // New API requires explicit field fetching
    await place.fetchFields({
      fields: ["location", "formattedAddress", "displayName"],
    });

    const lat = place.location?.lat().toString() || "";
    const lng = place.location?.lng().toString() || "";
    const address = place.formattedAddress || place.displayName || "";

    return {
      lat,
      lng,
      address,
      name: place.displayName,
    };
  } catch (error) {
    console.error("Error extracting location from new Place API:", error);
    return { lat: "", lng: "", address: "" };
  }
};

/**
 * Validate if coordinates are valid
 */
export const isValidCoordinates = (lat: string, lng: string): boolean => {
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);

  return (
    !isNaN(latNum) &&
    !isNaN(lngNum) &&
    latNum >= -90 &&
    latNum <= 90 &&
    lngNum >= -180 &&
    lngNum <= 180
  );
};

/**
 * Format coordinates for display
 */
export const formatCoordinates = (lat: string, lng: string): string => {
  if (!lat || !lng) return "—";
  return `${lat}, ${lng}`;
};

/**
 * Create a Google Maps URL from coordinates
 */
export const createMapsUrl = (lat: string, lng: string): string => {
  if (!lat || !lng) return "";
  return `https://www.google.com/maps/?q=${lat},${lng}`;
};
