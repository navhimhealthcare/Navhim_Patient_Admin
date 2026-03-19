import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import Button from "../../../components/Button/Button";
import Input from "../../../components/Input/Input";
import appLogo from "../../../assets/images/appLogo.png";
import { districtApi, registerAPI, stateApi } from "../authAPI";
import showToast from "../../../utils/toast";
import { useLoader } from "../../../App";

// ── Indian states + districts data ───────────────────────────────────────
const STATE_DISTRICTS: Record<string, string[]> = {
  "Madhya Pradesh": [
    "Bhopal",
    "Indore",
    "Jabalpur",
    "Gwalior",
    "Ujjain",
    "Sagar",
    "Rewa",
    "Satna",
    "Dewas",
    "Chhindwara",
  ],
  Maharashtra: [
    "Mumbai",
    "Pune",
    "Nagpur",
    "Nashik",
    "Aurangabad",
    "Solapur",
    "Thane",
    "Kolhapur",
    "Amravati",
    "Nanded",
  ],
  Delhi: [
    "Central Delhi",
    "East Delhi",
    "New Delhi",
    "North Delhi",
    "North East Delhi",
    "North West Delhi",
    "South Delhi",
    "South East Delhi",
    "South West Delhi",
    "West Delhi",
  ],
  Karnataka: [
    "Bangalore Urban",
    "Mysore",
    "Hubli-Dharwad",
    "Mangalore",
    "Belagavi",
    "Kalaburagi",
    "Davangere",
    "Bellary",
    "Bijapur",
    "Shimoga",
  ],
  Gujarat: [
    "Ahmedabad",
    "Surat",
    "Vadodara",
    "Rajkot",
    "Bhavnagar",
    "Jamnagar",
    "Junagadh",
    "Gandhinagar",
    "Anand",
    "Mehsana",
  ],
  Rajasthan: [
    "Jaipur",
    "Jodhpur",
    "Udaipur",
    "Kota",
    "Ajmer",
    "Bikaner",
    "Alwar",
    "Bharatpur",
    "Sikar",
    "Pali",
  ],
  "Uttar Pradesh": [
    "Lucknow",
    "Kanpur",
    "Agra",
    "Varanasi",
    "Allahabad",
    "Meerut",
    "Noida",
    "Ghaziabad",
    "Bareilly",
    "Gorakhpur",
  ],
  "Tamil Nadu": [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Tiruchirappalli",
    "Salem",
    "Tirunelveli",
    "Erode",
    "Vellore",
    "Thoothukudi",
    "Dindigul",
  ],
  "West Bengal": [
    "Kolkata",
    "Howrah",
    "Durgapur",
    "Asansol",
    "Siliguri",
    "Malda",
    "Bardhaman",
    "Jalpaiguri",
    "Murshidabad",
    "Nadia",
  ],
  Telangana: [
    "Hyderabad",
    "Warangal",
    "Nizamabad",
    "Karimnagar",
    "Ramagundam",
    "Khammam",
    "Mahbubnagar",
    "Nalgonda",
    "Adilabad",
    "Suryapet",
  ],
};

const STATES = Object.keys(STATE_DISTRICTS).sort();

interface FormState {
  name: string;
  email: string;
  mobile: string;
  address: string;
  state: string;
  district: string;
  password: string;
  confirm: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  mobile: "",
  address: "",
  state: "",
  district: "",
  password: "",
  confirm: "",
};

// ── Avatar Upload Preview ─────────────────────────────────────────────────
function AvatarUpload({
  file,
  onChange,
}: {
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = file ? URL.createObjectURL(file) : null;

  return (
    <div className="flex flex-col items-center gap-2.5 w-full">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative w-16 h-16 rounded-2xl border-2 border-dashed border-white/30 hover:border-brand-light bg-white/5 hover:bg-white/10 transition-all duration-200 overflow-hidden flex items-center justify-center"
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Avatar preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">Change</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-0.5 text-white/30 group-hover:text-brand-light transition-colors">
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <circle
                cx="14"
                cy="10"
                r="5"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M4 24c0-5.523 4.477-10 10-10s10 4.477 10 10"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-[9px] font-semibold leading-tight text-center">
              Upload
            </span>
          </div>
        )}
      </button>

      {file ? (
        <button
          type="button"
          onClick={() => {
            onChange(null);
            if (inputRef.current) inputRef.current.value = "";
          }}
          className="text-[10px] text-white/40 hover:text-red-400 font-medium transition-colors"
        >
          Remove
        </button>
      ) : (
        <p className="text-[10px] text-white/30 text-center leading-tight">
          Profile photo
          <br />
          optional
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          if (f.size > 5 * 1024 * 1024) {
            showToast.warn("Image must be under 5 MB.");
            return;
          }
          onChange(f);
        }}
      />
    </div>
  );
}

// ── Select wrapper that matches Input styling ─────────────────────────────
function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  error,
  icon,
  disabled = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  placeholder: string;
  error?: string;
  icon?: any;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11.5px] font-semibold text-navy">{label}</label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base pointer-events-none z-10">
            {icon}
          </span>
        )}
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full h-9 ${icon ? "pl-10" : "pl-3"} pr-9 rounded-xl border text-[13px] font-medium appearance-none outline-none transition-all bg-white
            ${
              error
                ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-navy"
                : "border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 text-navy"
            }
            ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "cursor-pointer"}
            ${!value ? "text-gray-400" : "text-navy"}
          `}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M2 4l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {error && (
        <p className="text-[11.5px] text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const navigate = useNavigate();
  const { withLoader } = useLoader();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCfm, setShowCfm] = useState(false);
  const [stateList, setStateList] = useState([]);
  const [districtList, setDistrictList] = useState([]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await stateApi();
        setStateList(res.data || res);
      } catch (err) {
        console.error("Failed to load states:", err);
      }
    };
    fetchStates();
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (!form.state) return;
      try {
        const res = await districtApi(form.state);
        setDistrictList(res.data || res);
      } catch (err) {
        console.error("Failed to load districts:", err);
      }
    };
    fetchDistricts();
  }, [form.state]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({
      ...p,
      [name]: value,
      // reset district when state changes
      ...(name === "state" ? { district: "" } : {}),
    }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = (): Partial<FormState> => {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    else if (form.name.trim().length < 2)
      e.name = "Name must be at least 2 characters";

    if (!form.email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email))
      e.email = "Enter a valid email address";

    if (!form.mobile) e.mobile = "Mobile number is required";
    else if (!/^[6-9]\d{9}$/.test(form.mobile))
      e.mobile = "Enter a valid 10-digit Indian mobile number";

    if (!form.address.trim()) e.address = "Address is required";
    if (!form.state) e.state = "Please select a state";
    if (!form.district) e.district = "Please select a district";

    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8)
      e.password = "Password must be at least 8 characters";
    else if (!/[A-Z]/.test(form.password))
      e.password = "Password must contain at least one uppercase letter";
    else if (!/[0-9]/.test(form.password))
      e.password = "Password must contain at least one number";

    if (!form.confirm) e.confirm = "Please confirm your password";
    else if (form.confirm !== form.password)
      e.confirm = "Passwords do not match";

    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      showToast.warn("Please fix the errors before continuing.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("email", form.email.toLowerCase().trim());
      fd.append("mobile", form.mobile.trim());
      fd.append("address", form.address.trim());
      fd.append("state", form.state);
      fd.append("district", form.district);
      fd.append("password", form.password);
      if (avatar) fd.append("avatar", avatar);

      const data = await withLoader(
        () => registerAPI(fd),
        "Creating your account…",
      );

      if (data?.success) {
        showToast.success("Account created! Please sign in.");
        setTimeout(() => navigate("/login"), 900);
      } else {
        showToast.error(data?.message || "Registration failed.");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Something went wrong. Please try again.";
      showToast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const pwStrength = (() => {
    const p = form.password;
    if (!p) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { label: "Weak", color: "bg-red-400", w: "w-1/4" };
    if (score === 2)
      return { label: "Fair", color: "bg-yellow-400", w: "w-2/4" };
    if (score === 3) return { label: "Good", color: "bg-blue-400", w: "w-3/4" };
    return { label: "Strong", color: "bg-green-500", w: "w-full" };
  })();

  return (
    <div className="fixed inset-0 bg-navy flex items-center justify-center p-2 overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-brand-primary/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-3xl max-h-[96vh] bg-white rounded-3xl shadow-2xl animate-[fadeUp_0.4s_ease_both] overflow-hidden flex flex-col">
        {/* ══ Two-column layout ══ */}
        <div className="flex h-full">
          {/* ── LEFT: avatar panel ── */}
          <div className="w-44 flex-shrink-0 bg-gradient-to-b from-navy to-[#0A1B40] flex flex-col items-center justify-start gap-8 px-4 py-4">
            {/* Logo */}
            <div className="flex flex-row items-center text-center gap-3">
              <img
                src={appLogo}
                alt="Navhim"
                className="w-10 h-10 rounded-xl object-contain shadow-[0_4px_14px_rgba(75,105,255,0.3)]"
              />
              <span className="font-poppins font-bold text-[13px] text-white/90 tracking-tight leading-tight text-brand-ligh">
                Navhim
                <br />
                <span className="text-brand-light">Patient</span>
                <span className="text-brand-light">{"\n"}Admin</span>
              </span>
            </div>

            {/* Avatar */}
            <AvatarUpload file={avatar} onChange={setAvatar} />
          </div>

          {/* ── RIGHT: form panel ── */}
          <div className="flex-1 p-3.5 flex flex-col overflow-y-auto scrollbar-hide">
            <h2 className="font-poppins font-bold text-[16.5px] text-navy mb-0">
              Create an account
            </h2>
            <p className="text-[10px] text-gray-400 mb-2">
              Fill in the details below to register as an admin
            </p>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-1.5 flex-1"
              noValidate
            >
              {/* Row 1: Name + Email */}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Full Name"
                  name="name"
                  type="text"
                  placeholder="Rajan Sharma"
                  value={form.name}
                  onChange={handleChange}
                  icon="👤"
                  error={errors.name}
                  inputClassName="h-8 text-[12.5px] px-3"
                  className="gap-1"
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="admin@hospital.com"
                  value={form.email}
                  onChange={handleChange}
                  icon="📧"
                  error={errors.email}
                  inputClassName="h-8 text-[12.5px] px-3"
                  className="gap-1"
                />
              </div>

              {/* Row 2: Mobile + Address */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Input
                  label="Mobile Number"
                  name="mobile"
                  type="tel"
                  placeholder="9876543210"
                  value={form.mobile}
                  onChange={handleChange}
                  icon="📱"
                  error={errors.mobile}
                  inputClassName="h-8 text-[12.5px] px-3"
                  className="gap-1"
                />
                <Input
                  label="Address"
                  name="address"
                  type="text"
                  placeholder="123, MG Road, Near City Hospital"
                  value={form.address}
                  onChange={handleChange}
                  icon="📍"
                  error={errors.address}
                  inputClassName="h-8 text-[12.5px] px-3"
                  className="gap-1"
                />
              </div>

              {/* Row 3: State + District */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                <SelectField
                  label="State"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  options={stateList}
                  placeholder="Select state"
                  icon="🗺️"
                  error={errors.state}
                  className="gap-1"
                />
                <SelectField
                  label="District"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  options={districtList}
                  placeholder={
                    form.state ? "Select district" : "Select state first"
                  }
                  icon="📌"
                  error={errors.district}
                  disabled={!form.state}
                  className="gap-1 mb-8"
                />
              </div>

              {/* Row 4: Password + Confirm */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="flex flex-col gap-1">
                  <Input
                    label="Password"
                    name="password"
                    type={showPw ? "text" : "password"}
                    placeholder="Min. 8 chars, 1 uppercase, 1 number"
                    value={form.password}
                    onChange={handleChange}
                    icon="🔒"
                    error={errors.password}
                    inputClassName="h-8 text-[12.5px] px-3"
                    className="gap-1"
                    suffix={
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="text-gray-400 hover:text-navy transition-colors text-[9.5px] font-semibold pr-1"
                      >
                        {showPw ? "Hide" : "Show"}
                      </button>
                    }
                  />
                  {pwStrength && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${pwStrength.color} ${pwStrength.w}`}
                        />
                      </div>
                      <span
                        className={`text-[10px] font-bold
                        ${pwStrength.label === "Weak" ? "text-red-500" : ""}
                        ${pwStrength.label === "Fair" ? "text-yellow-600" : ""}
                        ${pwStrength.label === "Good" ? "text-blue-600" : ""}
                        ${pwStrength.label === "Strong" ? "text-green-600" : ""}
                      `}
                      >
                        {pwStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                <Input
                  label="Confirm Password"
                  name="confirm"
                  type={showCfm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={form.confirm}
                  onChange={handleChange}
                  icon="🔑"
                  error={errors.confirm}
                  inputClassName="h-8 text-[12.5px] px-3 "
                  className="gap-1"
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowCfm((v) => !v)}
                      className="text-gray-400 hover:text-navy transition-colors text-[9.5px] font-semibold pr-1 "
                    >
                      {showCfm ? "Hide" : "Show"}
                    </button>
                  }
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                loading={loading}
                className="w-full justify-center mt-6 h-8 text-[13px]"
                icon={null}
                onClick={undefined}
              >
                Create Account
              </Button>

              {/* Footer */}
              <p className="text-center text-[11px] text-gray-400 mt-2">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-brand-primary font-semibold hover:underline"
                >
                  Sign in
                </Link>
              </p>
              <p className="text-center text-[9px] text-gray-300">
                Protected by enterprise-grade security
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
