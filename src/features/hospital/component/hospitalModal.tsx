import { useState, useEffect, useRef } from "react";
import {
  Hospital,
  HospitalFormValues,
} from "../component/types/hospital.types";
import {
  formFromHospital,
  validateHospitalForm,
} from "../component/hospitalHelpers";
import { SpinnerIcon } from "../../../components/Loader/Loader";
import hospitalsIcon from "../../../assets/images/hospital.png";

const EMPTY_FORM: HospitalFormValues = {
  name: "",
  address: "",
  phone: "",
  email: "",
  lat: "",
  lng: "",
  isActive: true,
};

const inputCls =
  "w-full h-10 border border-black/10 rounded-xl px-3 text-[13px] font-medium text-navy " +
  "placeholder:text-gray-300 outline-none focus:border-brand-primary " +
  "focus:ring-2 focus:ring-brand-primary/10 transition-all";

const errorCls = "text-[11px] text-danger font-medium mt-0.5";

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

function Field({ label, required, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-semibold text-gray-500">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className={errorCls}>{error}</p>}
    </div>
  );
}

interface HospitalModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: HospitalFormValues) => Promise<boolean>;
  initialData: Hospital | null;
  loading: boolean;
}

export default function HospitalModal({
  open,
  onClose,
  onSubmit,
  initialData,
  loading,
}: HospitalModalProps) {
  const [form, setForm] = useState<HospitalFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof HospitalFormValues, string>>
  >({});
  const firstRef = useRef<HTMLInputElement>(null);
  const isEdit = !!initialData;

  useEffect(() => {
    if (open) {
      setForm(initialData ? formFromHospital(initialData) : EMPTY_FORM);
      setErrors({});
      setTimeout(() => firstRef.current?.focus(), 80);
    }
  }, [open, initialData]);

  if (!open) return null;

  const set =
    (k: keyof HospitalFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((p) => ({
        ...p,
        [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
      }));
      setErrors((p) => ({ ...p, [k]: undefined }));
    };

  const handleSubmit = async () => {
    const errs = validateHospitalForm(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    const ok = await onSubmit(form);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-[fadeUp_0.25s_ease_both] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-primary to-brand-gradient px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-xl">
              <img
                src={hospitalsIcon}
                alt={"hospitals"}
                className="w-8 h-8 flex-shrink-0 object-contain opacity-90 group-hover:opacity-90 transition-opacity"
              />
            </div>
            <div>
              <h2 className="font-poppins font-bold text-white text-[16px]">
                {isEdit ? "Edit Hospital" : "Add New Hospital"}
              </h2>
              <p className="text-white/60 text-[11px]">
                {isEdit
                  ? "Update hospital details"
                  : "Fill in the details below"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
          <Field label="Hospital Name" required error={errors.name}>
            <input
              ref={firstRef}
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. Apollo Hospital"
              className={inputCls}
            />
          </Field>

          <Field label="Address" required error={errors.address}>
            <input
              value={form.address}
              onChange={set("address")}
              placeholder="e.g. Bandra, Mumbai"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone" error={errors.phone}>
              <input
                value={form.phone}
                onChange={set("phone")}
                placeholder="+91-217-2317600"
                className={inputCls}
                maxLength={20}
              />
            </Field>
            <Field label="Email" error={errors.email}>
              <input
                value={form.email}
                onChange={set("email")}
                type="email"
                placeholder="admin@hospital.com"
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude" error={errors.lat}>
              <input
                value={form.lat}
                onChange={set("lat")}
                placeholder="12.9716"
                className={inputCls}
              />
            </Field>
            <Field label="Longitude" error={errors.lng}>
              <input
                value={form.lng}
                onChange={set("lng")}
                placeholder="77.5946"
                className={inputCls}
              />
            </Field>
          </div>

          {/* Toggle */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
          >
            <div
              className={`relative rounded-full transition-colors duration-200 flex-shrink-0
                ${form.isActive ? "bg-brand-primary" : "bg-gray-200"}`}
              style={{ width: 40, height: 22 }}
            >
              <div
                className={`absolute top-0.5 w-[18px] h-[18px] bg-white rounded-full shadow
                transition-transform duration-200
                ${form.isActive ? "translate-x-[22px]" : "translate-x-0.5"}`}
              />
            </div>
            <span className="text-[13px] font-semibold text-navy">
              Active Hospital
            </span>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full
              ${form.isActive ? "bg-success-bg text-green-700" : "bg-gray-100 text-gray-400"}`}
            >
              {form.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 flex gap-3 justify-end border-t border-brand-primary/[0.08]">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-500 hover:bg-surface transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-gradient text-white text-[13px] font-semibold shadow-btn hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {loading && <SpinnerIcon size="sm" color="white" />}
            {isEdit ? "Save Changes" : "Add Hospital"}
          </button>
        </div>
      </div>
    </div>
  );
}

// import { useState, useEffect, useRef } from "react";
// import { useLoadScript } from "@react-google-maps/api";
// import {
//   Hospital,
//   HospitalFormValues,
// } from "../component/types/hospital.types";
// import {
//   formFromHospital,
//   validateHospitalForm,
// } from "../component/hospitalHelpers";
// import { SpinnerIcon } from "../../../components/Loader/Loader";
// import hospitalsIcon from "../../../assets/images/hospital.png";
// import { GOOGLE_MAPS_LIBRARIES } from "../../../utils/googlePlaces";
// import { GCP_API_KEY } from "../../../utils/constants";

// const EMPTY_FORM: HospitalFormValues = {
//   name: "",
//   address: "",
//   phone: "",
//   email: "",
//   lat: "",
//   lng: "",
//   isActive: true,
// };

// const inputCls =
//   "w-full h-10 border border-black/10 rounded-xl px-3 text-[13px] font-medium text-navy " +
//   "placeholder:text-gray-300 outline-none focus:border-brand-primary " +
//   "focus:ring-2 focus:ring-brand-primary/10 transition-all";

// const errorCls = "text-[11px] text-danger font-medium mt-0.5";

// interface FieldProps {
//   label: string;
//   required?: boolean;
//   error?: string;
//   children: React.ReactNode;
// }

// function Field({ label, required, error, children }: FieldProps) {
//   return (
//     <div className="flex flex-col gap-1">
//       <label className="text-[12px] font-semibold text-gray-500">
//         {label}
//         {required && <span className="text-danger ml-0.5">*</span>}
//       </label>
//       {children}
//       {error && <p className={errorCls}>{error}</p>}
//     </div>
//   );
// }

// interface HospitalModalProps {
//   open: boolean;
//   onClose: () => void;
//   onSubmit: (form: HospitalFormValues) => Promise<boolean>;
//   initialData: Hospital | null;
//   loading: boolean;
// }

// declare global {
//   interface Window {
//     google: any;
//   }
// }

// export default function HospitalModal({
//   open,
//   onClose,
//   onSubmit,
//   initialData,
//   loading,
// }: HospitalModalProps) {
//   const [form, setForm] = useState<HospitalFormValues>(EMPTY_FORM);
//   const [errors, setErrors] = useState<
//     Partial<Record<keyof HospitalFormValues, string>>
//   >({});
//   const [suggestions, setSuggestions] = useState<
//     google.maps.places.AutocompletePrediction[]
//   >([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [apiReady, setApiReady] = useState(false);
//   const [searchLoading, setSearchLoading] = useState(false);

//   const firstRef = useRef<HTMLInputElement>(null);
//   const addressInputRef = useRef<HTMLInputElement>(null);
//   const suggestionsRef = useRef<HTMLDivElement>(null);
//   const autocompleteServiceRef =
//     useRef<google.maps.places.AutocompleteService | null>(null);
//   const placesServiceRef = useRef<google.maps.places.PlacesService | null>(
//     null,
//   );

//   const isEdit = !!initialData;
//   console.log("GCP_API_KEY", GCP_API_KEY);

//   // Load Google Maps
//   const { isLoaded, loadError } = useLoadScript({
//     googleMapsApiKey: GCP_API_KEY,
//     libraries: GOOGLE_MAPS_LIBRARIES,
//   });

//   // Initialize services when Google Maps is loaded
//   useEffect(() => {
//     if (!isLoaded || !window.google?.maps?.places) {
//       return;
//     }

//     try {
//       // Create hidden map for PlacesService
//       const mapContainer = document.createElement("div");
//       mapContainer.style.display = "none";
//       document.body.appendChild(mapContainer);

//       const map = new window.google.maps.Map(mapContainer, {
//         center: { lat: 20.5937, lng: 78.9629 },
//         zoom: 4,
//       });

//       // Initialize services
//       autocompleteServiceRef.current =
//         new window.google.maps.places.AutocompleteService();
//       placesServiceRef.current = new window.google.maps.places.PlacesService(
//         map,
//       );

//       setApiReady(true);
//       console.log("✅ Google Maps initialized");
//     } catch (error) {
//       console.error("❌ Error initializing Google Maps:", error);
//     }
//   }, [isLoaded]);

//   // Initialize form when modal opens
//   useEffect(() => {
//     if (open) {
//       setForm(initialData ? formFromHospital(initialData) : EMPTY_FORM);
//       setErrors({});
//       setSuggestions([]);
//       setShowSuggestions(false);
//       setTimeout(() => firstRef.current?.focus(), 80);
//     }
//   }, [open, initialData]);

//   // Close suggestions when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         suggestionsRef.current &&
//         !suggestionsRef.current.contains(event.target as Node) &&
//         !addressInputRef.current?.contains(event.target as Node)
//       ) {
//         setShowSuggestions(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   if (!open) return null;

//   if (loadError) {
//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//         <div
//           className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
//           onClick={onClose}
//         />
//         <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 text-center">
//           <p className="text-danger font-semibold mb-2">❌ Google Maps Error</p>
//           <p className="text-gray-600 text-sm mb-4">
//             {loadError.message || "Failed to load Google Maps API"}
//           </p>
//           <div className="bg-yellow-50 p-3 rounded-lg text-sm text-left mb-4">
//             <p className="text-yellow-800 mb-2">
//               <strong>To fix this:</strong>
//             </p>
//             <ol className="text-yellow-800 text-xs space-y-1 list-decimal list-inside">
//               <li>Create .env.local in project root</li>
//               <li>Add: REACT_APP_GCP_API_KEY=your_key_here</li>
//               <li>Restart: npm start</li>
//             </ol>
//           </div>
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const set =
//     (k: keyof HospitalFormValues) =>
//     (e: React.ChangeEvent<HTMLInputElement>) => {
//       setForm((p) => ({
//         ...p,
//         [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
//       }));
//       setErrors((p) => ({ ...p, [k]: undefined }));
//     };

//   const handleAddressInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setForm((p) => ({ ...p, address: value }));
//     setErrors((p) => ({ ...p, address: undefined }));

//     if (!value || value.length < 2 || !apiReady) {
//       setSuggestions([]);
//       setShowSuggestions(false);
//       return;
//     }

//     if (!autocompleteServiceRef.current) {
//       return;
//     }

//     setSearchLoading(true);

//     try {
//       const response = await autocompleteServiceRef.current.getPlacePredictions(
//         {
//           input: value,
//         },
//       );

//       if (response?.predictions) {
//         setSuggestions(response.predictions);
//         setShowSuggestions(true);
//       } else {
//         setSuggestions([]);
//       }
//     } catch (error) {
//       console.error("Error fetching suggestions:", error);
//       setSuggestions([]);
//     } finally {
//       setSearchLoading(false);
//     }
//   };

//   const handleSuggestionClick = (
//     prediction: google.maps.places.AutocompletePrediction,
//   ) => {
//     if (!placesServiceRef.current) {
//       return;
//     }

//     try {
//       placesServiceRef.current.getDetails(
//         {
//           placeId: prediction.place_id,
//           fields: ["geometry", "formatted_address"],
//         },
//         (place: google.maps.places.PlaceResult | null) => {
//           if (!place?.geometry?.location) {
//             return;
//           }

//           const lat = place.geometry.location.lat().toString();
//           const lng = place.geometry.location.lng().toString();
//           const address = place.formatted_address || prediction.description;

//           setForm((p) => ({
//             ...p,
//             address,
//             lat,
//             lng,
//           }));

//           setShowSuggestions(false);
//           setSuggestions([]);
//         },
//       );
//     } catch (error) {
//       console.error("Error getting place details:", error);
//     }
//   };

//   const handleSubmit = async () => {
//     const errs = validateHospitalForm(form);
//     if (Object.keys(errs).length) {
//       setErrors(errs);
//       return;
//     }
//     const ok = await onSubmit(form);
//     if (ok) onClose();
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div
//         className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
//         onClick={onClose}
//       />

//       <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-[fadeUp_0.25s_ease_both] overflow-hidden">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-brand-primary to-brand-gradient px-6 py-5 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
//               <img
//                 src={hospitalsIcon}
//                 alt="hospitals"
//                 className="w-8 h-8 object-contain"
//               />
//             </div>
//             <div>
//               <h2 className="font-poppins font-bold text-white text-[16px]">
//                 {isEdit ? "Edit Hospital" : "Add New Hospital"}
//               </h2>
//               <p className="text-white/60 text-[11px]">
//                 {isEdit ? "Update details" : "Fill details below"}
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
//           >
//             ✕
//           </button>
//         </div>

//         {/* Status Bar */}
//         <div
//           className={`px-6 py-2.5 border-b text-[12px] flex items-center gap-2 ${
//             apiReady
//               ? "bg-green-50 border-green-200 text-green-700"
//               : "bg-yellow-50 border-yellow-200 text-yellow-700"
//           }`}
//         >
//           <span>{apiReady ? "✅" : "⏳"}</span>
//           <span>
//             {apiReady ? "Location search ready" : "Initializing maps..."}
//           </span>
//         </div>

//         {/* Body */}
//         <div className="px-6 py-5 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
//           <Field label="Hospital Name" required error={errors.name}>
//             <input
//               ref={firstRef}
//               value={form.name}
//               onChange={set("name")}
//               placeholder="e.g. Apollo Hospital"
//               className={inputCls}
//             />
//           </Field>

//           <Field label="Address" required error={errors.address}>
//             <div className="relative">
//               <input
//                 ref={addressInputRef}
//                 value={form.address}
//                 onChange={handleAddressInput}
//                 onFocus={() => {
//                   if (suggestions.length > 0) setShowSuggestions(true);
//                 }}
//                 placeholder={
//                   apiReady ? "🔍 Type city or address..." : "⏳ Loading..."
//                 }
//                 disabled={!apiReady}
//                 className={`${inputCls} ${!apiReady ? "opacity-50" : ""}`}
//                 autoComplete="off"
//               />

//               {searchLoading && (
//                 <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin">
//                   ⟳
//                 </div>
//               )}

//               {showSuggestions && suggestions.length > 0 && (
//                 <div
//                   ref={suggestionsRef}
//                   className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-[100] max-h-60 overflow-y-auto"
//                 >
//                   {suggestions.map((suggestion) => (
//                     <button
//                       key={suggestion.place_id}
//                       onClick={() => handleSuggestionClick(suggestion)}
//                       type="button"
//                       className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
//                     >
//                       <div className="text-[13px] font-medium text-navy">
//                         📍 {suggestion.main_text}
//                       </div>
//                       <div className="text-[11px] text-gray-500 mt-0.5">
//                         {suggestion.secondary_text}
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//               )}

//               {showSuggestions && suggestions.length === 0 && form.address && (
//                 <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-center">
//                   <p className="text-[12px] text-gray-500">
//                     No locations found
//                   </p>
//                 </div>
//               )}
//             </div>
//             <p className="text-[11px] text-gray-400 mt-1">
//               ℹ️ Type to search for locations
//             </p>
//           </Field>

//           <div className="grid grid-cols-2 gap-3">
//             <Field label="Phone" error={errors.phone}>
//               <input
//                 value={form.phone}
//                 onChange={set("phone")}
//                 placeholder="9876543210"
//                 type="tel"
//                 className={inputCls}
//                 maxLength={10}
//               />
//             </Field>
//             <Field label="Email" error={errors.email}>
//               <input
//                 value={form.email}
//                 onChange={set("email")}
//                 type="email"
//                 placeholder="admin@hospital.com"
//                 className={inputCls}
//               />
//             </Field>
//           </div>

//           <div className="grid grid-cols-2 gap-3">
//             <Field label="Latitude" required error={errors.lat}>
//               <input
//                 value={form.lat}
//                 onChange={set("lat")}
//                 placeholder="-90 to 90"
//                 type="number"
//                 step="0.000001"
//                 className={inputCls}
//               />
//             </Field>
//             <Field label="Longitude" required error={errors.lng}>
//               <input
//                 value={form.lng}
//                 onChange={set("lng")}
//                 placeholder="-180 to 180"
//                 type="number"
//                 step="0.000001"
//                 className={inputCls}
//               />
//             </Field>
//           </div>

//           {(form.lat || form.lng) && (
//             <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-3 border border-blue-200">
//               <p className="text-[11px] text-gray-600 mb-2 flex items-center gap-2">
//                 <span>📍</span> Current Coordinates
//               </p>
//               <div className="flex items-center justify-between gap-3">
//                 <div className="flex-1">
//                   <span className="text-[10px] text-gray-500">Lat: </span>
//                   <code className="text-[12px] font-mono text-navy font-semibold">
//                     {form.lat || "—"}
//                   </code>
//                 </div>
//                 <div className="flex-1">
//                   <span className="text-[10px] text-gray-500">Lng: </span>
//                   <code className="text-[12px] font-mono text-navy font-semibold">
//                     {form.lng || "—"}
//                   </code>
//                 </div>
//                 {form.lat && form.lng && (
//                   <button
//                     type="button"
//                     onClick={() =>
//                       navigator.clipboard.writeText(`${form.lat}, ${form.lng}`)
//                     }
//                     className="text-[11px] px-2 py-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
//                   >
//                     Copy
//                   </button>
//                 )}
//               </div>
//             </div>
//           )}

//           <div
//             className="flex items-center gap-3 cursor-pointer select-none p-3 rounded-lg hover:bg-gray-50"
//             onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
//           >
//             <div
//               className={`relative rounded-full flex-shrink-0 ${
//                 form.isActive ? "bg-brand-primary" : "bg-gray-200"
//               }`}
//               style={{ width: 40, height: 22 }}
//             >
//               <div
//                 className={`absolute top-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-transform ${
//                   form.isActive ? "translate-x-[22px]" : "translate-x-0.5"
//                 }`}
//               />
//             </div>
//             <span className="text-[13px] font-semibold text-navy">
//               Active Hospital
//             </span>
//             <span
//               className={`text-[11px] font-medium px-2 py-0.5 rounded-full ml-auto ${
//                 form.isActive
//                   ? "bg-green-100 text-green-700"
//                   : "bg-gray-100 text-gray-400"
//               }`}
//             >
//               {form.isActive ? "Active" : "Inactive"}
//             </span>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="px-6 pb-6 pt-4 flex gap-3 justify-end border-t border-brand-primary/[0.08]">
//           <button
//             onClick={onClose}
//             disabled={loading}
//             className="px-5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-500 hover:bg-gray-50 disabled:opacity-50"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={loading}
//             className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-gradient text-white text-[13px] font-semibold shadow-lg hover:opacity-90 disabled:opacity-60"
//           >
//             {loading && <SpinnerIcon size="sm" color="white" />}
//             {isEdit ? "Save Changes" : "Add Hospital"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
