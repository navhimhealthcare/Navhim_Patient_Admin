import { useState, useRef, useEffect } from "react";
import { useProfile } from "../hooks/useProfile";
import { SectionLoader } from "../../../components/Loader/Loader";
import Input from "../../../components/Input/Input";
import Button from "../../../components/Button/Button";
import showToast from "../../../utils/toast";
import { districtApi, stateApi } from "../../auth/authAPI";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const getInitials = (name: string) =>
  name.trim().split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

// ── SelectField ───────────────────────────────────────────────────────────
function SelectField({
  label, name, value, onChange, options, placeholder, error, icon, disabled = false,
}: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[]; placeholder: string;
  error?: string; icon?: string; disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12.5px] font-semibold text-navy">{label}</label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base pointer-events-none z-10">{icon}</span>
        )}
        <select name={name} value={value} onChange={onChange} disabled={disabled}
          className={`w-full h-11 ${icon ? "pl-10" : "pl-3"} pr-9 rounded-xl border text-[13px] font-medium appearance-none outline-none transition-all bg-white
            ${error ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"}
            ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "cursor-pointer"}
            ${!value ? "text-gray-400" : "text-navy"}`}>
          <option value="" disabled>{placeholder}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {error && <p className="text-[11.5px] text-red-500 font-medium">{error}</p>}
    </div>
  );
}

// ── Avatar section ────────────────────────────────────────────────────────
function AvatarSection({
  src, name, isEditing, file, onFileChange,
}: {
  src: string | null; name: string; isEditing: boolean;
  file: File | null; onFileChange: (f: File | null) => void;
}) {
  const inputRef   = useRef<HTMLInputElement>(null);
  const previewUrl = file ? URL.createObjectURL(file) : src;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative group">
        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-brand-lighter border-2 border-brand-soft flex items-center justify-center">
          {previewUrl
            ? <img src={previewUrl} alt={name} className="w-full h-full object-cover" />
            : <span className="font-poppins font-black text-[24px] text-brand-primary">{getInitials(name)}</span>
          }
        </div>
        {isEditing && (
          <button type="button" onClick={() => inputRef.current?.click()}
            className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex flex-col items-center gap-0.5 text-white">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path d="M13 2L16 5L6 15H3V12L13 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              <span className="text-[9px] font-bold">Change</span>
            </div>
          </button>
        )}
      </div>

      {isEditing && (
        <div className="flex flex-col items-center gap-0.5">
          <button type="button" onClick={() => inputRef.current?.click()}
            className="text-[11px] text-brand-primary font-semibold hover:underline">
            {previewUrl ? "Change photo" : "Upload photo"}
          </button>
          {file && (
            <button type="button"
              onClick={() => { onFileChange(null); if (inputRef.current) inputRef.current.value = ""; }}
              className="text-[10px] text-gray-400 hover:text-red-500 transition-colors">
              Remove
            </button>
          )}
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          if (f.size > 5 * 1024 * 1024) { showToast.warn("Image must be under 5 MB."); return; }
          onFileChange(f);
        }}
      />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { profile, loading, actionLoading, updateProfile } = useProfile();

  const [isEditing,    setIsEditing]    = useState(false);
  const [avatarFile,   setAvatarFile]   = useState<File | null>(null);
  const [form,         setForm]         = useState({ name: "", email: "", mobile: "", address: "", state: "", district: "" });
  const [errors,       setErrors]       = useState<Record<string, string>>({});
  const [stateList,    setStateList]    = useState<string[]>([]);
  const [districtList, setDistrictList] = useState<string[]>([]);

  useEffect(() => {
    stateApi().then((res) => setStateList(res.data || res)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!form.state) return;
    districtApi(form.state).then((res) => setDistrictList(res.data || res)).catch(console.error);
  }, [form.state]);

  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name, email: profile.email, mobile: profile.mobile,
        address: profile.address, state: profile.state, district: profile.district });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value, ...(name === "state" ? { district: "" } : {}) }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())  e.name     = "Full name is required";
    if (!form.email)        e.email    = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.mobile)       e.mobile   = "Mobile number is required";
    else if (!/^[6-9]\d{9}$/.test(form.mobile)) e.mobile = "Enter a valid 10-digit mobile number";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.state)          e.state   = "Please select a state";
    if (!form.district)       e.district = "Please select a district";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); showToast.warn("Please fix the errors."); return; }
    const ok = await updateProfile({ ...form, avatar: avatarFile });
    if (ok) { setIsEditing(false); setAvatarFile(null); }
  };

  const handleCancel = () => {
    if (!profile) return;
    setForm({ name: profile.name, email: profile.email, mobile: profile.mobile,
      address: profile.address, state: profile.state, district: profile.district });
    setErrors({}); setAvatarFile(null); setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 min-h-[400px] flex items-center justify-center">
        <SectionLoader text="Loading profile…" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex flex-col gap-6 pb-6">

      {/* ══ PAGE HEADER ══ */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-poppins font-black text-[28px] text-navy tracking-tight leading-none">My Profile</h1>
          <p className="text-[13.5px] text-gray-400 font-medium mt-1">View and manage your account information</p>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-brand-primary to-brand-gradient text-white text-[13px] font-bold shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:-translate-y-0.5 transition-all duration-200">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M10 1.5L12.5 4L5 11.5H2.5V9L10 1.5Z" stroke="white" strokeWidth="1.6" strokeLinejoin="round"/>
            </svg>
            Edit Profile
          </button>
        )}
      </div>

      {/* ══ TWO CARDS — same height via items-stretch ══ */}
      <div className="grid grid-cols-3 gap-5 items-stretch">

        {/* ── LEFT: single unified card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">

          {/* Gradient banner */}
          <div className="h-16 bg-gradient-to-br from-brand-primary to-brand-gradient relative flex-shrink-0">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "18px 18px" }}
            />
          </div>

          {/* Avatar + identity — overlaps banner */}
          <div className="flex flex-col items-center text-center px-5 -mt-10 pb-4 border-b border-gray-100">
            <AvatarSection src={profile.avatar} name={profile.name}
              isEditing={isEditing} file={avatarFile} onFileChange={setAvatarFile} />
            <h2 className="font-poppins font-black text-[15px] text-navy leading-tight mt-2">{profile.name}</h2>
            <p className="text-[11px] text-gray-400 mt-0.5 w-full truncate">{profile.email}</p>
            <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-brand-lighter text-brand-primary">
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                <path d="M5 1L6.5 3.5L9.5 4L7.5 6L8 9L5 7.5L2 9L2.5 6L0.5 4L3.5 3.5L5 1Z" fill="currentColor"/>
              </svg>
              {profile.role}
            </span>
          </div>

          {/* All info rows in one block */}
          <div className="px-5 py-3 flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-2">Account Details</p>
            {[
              { icon: "📱", label: "Mobile",       value: profile.mobile   },
              { icon: "📍", label: "Address",      value: profile.address  },
              { icon: "🗺️", label: "State",        value: profile.state    },
              { icon: "📌", label: "District",     value: profile.district },
              { icon: "📅", label: "Member since", value: formatDate(profile.createdAt) },
              { icon: "🔄", label: "Last updated", value: formatDate(profile.updatedAt) },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-start gap-2.5 py-2.5 border-b border-gray-50 last:border-0">
                <span className="text-sm flex-shrink-0 mt-0.5">{icon}</span>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-300 font-semibold uppercase tracking-wide leading-none mb-0.5">{label}</p>
                  <p className="text-[12.5px] font-semibold text-navy leading-tight break-words">{value || "—"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: detail panel (col-span-2) ── */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">

          {/* Panel header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <div>
              <h3 className="font-poppins font-bold text-[15px] text-navy">
                {isEditing ? "Edit Information" : "Personal Information"}
              </h3>
              <p className="text-[11.5px] text-gray-400 mt-0.5">
                {isEditing ? "Make changes and save when you're done" : "Your registered account details"}
              </p>
            </div>
            {isEditing && (
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <circle cx="5" cy="5" r="4.5" stroke="currentColor" strokeWidth="1"/>
                  <path d="M5 3v2.5L6.5 7" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                </svg>
                Editing
              </span>
            )}
          </div>

          {/* Panel body */}
          <div className="p-6 flex-1">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full" noValidate>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Full Name" name="name" type="text" placeholder="Dr. Rajan Sharma"
                    value={form.name} onChange={handleChange} icon="👤" error={errors.name} />
                  <Input label="Email Address" name="email" type="email" placeholder="admin@hospital.com"
                    value={form.email} onChange={handleChange} icon="📧" error={errors.email} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Mobile Number" name="mobile" type="tel" placeholder="9876543210"
                    value={form.mobile} onChange={handleChange} icon="📱" error={errors.mobile} />
                  <Input label="Address" name="address" type="text" placeholder="123, MG Road"
                    value={form.address} onChange={handleChange} icon="📍" error={errors.address} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <SelectField label="State" name="state" value={form.state}
                    onChange={handleChange} options={stateList}
                    placeholder="Select state" icon="🗺️" error={errors.state} />
                  <SelectField label="District" name="district" value={form.district}
                    onChange={handleChange} options={districtList}
                    placeholder={form.state ? "Select district" : "Select state first"}
                    icon="📌" error={errors.district} disabled={!form.state} />
                </div>

                {/* Spacer pushes actions to bottom */}
                <div className="flex-1" />

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <Button type="submit" loading={actionLoading} className="justify-center px-8">
                    Save Changes
                  </Button>
                  <button type="button" onClick={handleCancel}
                    className="px-6 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-500 hover:bg-gray-50 hover:text-navy transition-all">
                    Cancel
                  </button>
                </div>
              </form>

            ) : (
              <div className="flex flex-col gap-0">
                {[
                  { icon: "👤", label: "Full Name",     value: profile.name     },
                  { icon: "📧", label: "Email Address", value: profile.email    },
                  { icon: "📱", label: "Mobile Number", value: profile.mobile   },
                  { icon: "📍", label: "Address",       value: profile.address  },
                  { icon: "🗺️", label: "State",         value: profile.state    },
                  { icon: "📌", label: "District",      value: profile.district },
                ].map(({ icon, label, value }) => (
                  <div key={label}
                    className="flex items-center gap-4 py-3.5 border-b border-gray-50 last:border-0 group hover:bg-gray-50/60 -mx-6 px-6 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-brand-lighter flex items-center justify-center flex-shrink-0 text-sm">
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10.5px] font-semibold text-gray-300 uppercase tracking-wide leading-none mb-1">{label}</p>
                      <p className="text-[13.5px] font-semibold text-navy truncate">{value || "—"}</p>
                    </div>
                    <svg className="text-gray-200 group-hover:text-gray-300 transition-colors flex-shrink-0" width="13" height="13" viewBox="0 0 14 14" fill="none">
                      <path d="M5.5 3.5L9 7L5.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ))}

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button onClick={() => setIsEditing(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-[13px] font-semibold text-gray-400 hover:border-brand-primary hover:text-brand-primary hover:bg-brand-lighter transition-all">
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                      <path d="M10 1.5L12.5 4L5 11.5H2.5V9L10 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                    Edit Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
