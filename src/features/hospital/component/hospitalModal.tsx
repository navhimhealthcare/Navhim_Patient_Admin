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
                placeholder="9876543210"
                className={inputCls}
                maxLength={10}
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
