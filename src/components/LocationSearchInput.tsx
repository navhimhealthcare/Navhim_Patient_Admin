import React, { useRef, useCallback, useState } from "react";
import { StandaloneSearchBox } from "@react-google-maps/api";
import { Coordinates, LocationDetails } from "../utils/googlePlaces";

interface LocationSearchInputProps {
  /** Current address value */
  value: string;
  /** Called when address changes (both manual and from search) */
  onChange: (address: string) => void;
  /** Called when a place is selected from search results */
  onLocationSelect: (details: LocationDetails) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Error message */
  error?: string;
  /** Whether Google Maps is loaded */
  isLoaded: boolean;
  /** Custom CSS class */
  className?: string;
  /** Show coordinates display */
  showCoordinates?: boolean;
  /** Current coordinates */
  coordinates?: Coordinates;
}

/**
 * LocationSearchInput Component
 * Provides autocomplete location search with automatic coordinate extraction
 *
 * Usage:
 * ```tsx
 * <LocationSearchInput
 *   value={address}
 *   onChange={setAddress}
 *   onLocationSelect={(details) => {
 *     setLat(details.lat);
 *     setLng(details.lng);
 *   }}
 *   isLoaded={isLoaded}
 *   coordinates={{ lat, lng }}
 * />
 * ```
 */
const LocationSearchInput = React.forwardRef<
  HTMLInputElement,
  LocationSearchInputProps
>(
  (
    {
      value,
      onChange,
      onLocationSelect,
      placeholder = "🔍 Search address, city, or hospital name",
      error,
      isLoaded,
      className = "",
      showCoordinates = true,
      coordinates,
    },
    ref
  ) => {
    const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    const inputCls =
      "w-full h-10 border border-black/10 rounded-xl px-3 text-[13px] font-medium text-navy " +
      "placeholder:text-gray-300 outline-none focus:border-brand-primary " +
      "focus:ring-2 focus:ring-brand-primary/10 transition-all";

    const handlePlacesChanged = useCallback(() => {
      if (!searchBoxRef.current) return;

      const places = searchBoxRef.current.getPlaces();
      if (!places || places.length === 0) {
        setIsSearching(false);
        return;
      }

      const place = places[0];

      if (!place.geometry || !place.geometry.location) {
        console.warn("Selected place has no geometry");
        setIsSearching(false);
        return;
      }

      try {
        const lat = place.geometry.location.lat().toString();
        const lng = place.geometry.location.lng().toString();
        const address = place.formatted_address || place.name || "";

        // Update the input field
        onChange(address);

        // Notify parent with full details
        onLocationSelect({
          lat,
          lng,
          address,
          name: place.name,
        });
      } catch (error) {
        console.error("Error processing place selection:", error);
      } finally {
        setIsSearching(false);
      }
    }, [onChange, onLocationSelect]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
      setIsSearching(true);
    };

    if (!isLoaded) {
      return (
        <input
          value={value}
          onChange={handleInputChange}
          placeholder="Loading maps..."
          className={`${inputCls} opacity-50 cursor-not-allowed`}
          disabled
        />
      );
    }

    return (
      <div className={className}>
        <StandaloneSearchBox
          onLoad={(ref) => {
            searchBoxRef.current = ref;
          }}
          onPlacesChanged={handlePlacesChanged}
        >
          <input
            ref={ref}
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={`${inputCls} placeholder:text-gray-400`}
            autoComplete="off"
          />
        </StandaloneSearchBox>

        {/* Helper text */}
        <div className="flex items-center gap-1 mt-1.5">
          <span className="text-[11px] text-gray-400">ℹ️</span>
          <span className="text-[11px] text-gray-400">
            {isSearching
              ? "Searching locations..."
              : "Select a location to auto-fill coordinates"}
          </span>
        </div>

        {/* Coordinates Display */}
        {showCoordinates && coordinates && (coordinates.lat || coordinates.lng) && (
          <div className="mt-2.5 p-2.5 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex gap-2 text-[11px]">
              <div className="flex-1">
                <span className="text-gray-600 font-medium">Lat: </span>
                <span className="text-navy font-mono font-semibold">
                  {coordinates.lat || "—"}
                </span>
              </div>
              <div className="flex-1">
                <span className="text-gray-600 font-medium">Lng: </span>
                <span className="text-navy font-mono font-semibold">
                  {coordinates.lng || "—"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && <p className="text-[11px] text-danger font-medium mt-0.5">{error}</p>}
      </div>
    );
  }
);

LocationSearchInput.displayName = "LocationSearchInput";

export default LocationSearchInput;
