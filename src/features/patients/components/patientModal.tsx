import { useState, useEffect, useRef } from "react";
import {
  Patient,
  PatientFormValues,
  PatientFormAddValues,
} from "../types/patient.types";
import {
  EMPTY_FORM,
  EMPTY_ADD_FORM,
  formFromPatient,
  validateAddForm,
  validateUpdateForm,
  BLOOD_GROUPS,
} from "../helpers/patientHelper";
import { SpinnerIcon } from "../../../components/Loader/Loader";
import userIcon from "../../../assets/images/user.png";

const inputCls =
  "w-full h-10 border border-black/10 rounded-xl px-3 text-[13px] font-medium text-navy " +
  "placeholder:text-gray-300 outline-none focus:border-brand-primary " +
  "focus:ring-2 focus:ring-brand-primary/10 transition-all bg-white";

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-semibold text-gray-500">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-[11px] text-danger font-medium mt-0.5">{error}</p>
      )}
    </div>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (form: PatientFormAddValues) => Promise<boolean>;
  onEdit: (form: PatientFormValues) => Promise<boolean>;
  initialData: Patient | null;
  loading: boolean;
}

export default function PatientModal({
  open,
  onClose,
  onAdd,
  onEdit,
  initialData,
  loading,
}: Props) {
  const isEdit = !!initialData;

  // ── Add form state ──
  const [addForm, setAddForm] = useState<PatientFormAddValues>(EMPTY_ADD_FORM);
  const [addErrors, setAddErrors] = useState<
    Partial<Record<keyof PatientFormAddValues, string>>
  >({});

  // ── Edit form state ──
  const [editForm, setEditForm] = useState<PatientFormValues>(EMPTY_FORM);
  const [editErrors, setEditErrors] = useState<
    Partial<Record<keyof PatientFormValues, string>>
  >({});

  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (isEdit && initialData) {
        setEditForm(formFromPatient(initialData));
        setEditErrors({});
      } else {
        setAddForm(EMPTY_ADD_FORM);
        setAddErrors({});
      }
      setTimeout(() => firstRef.current?.focus(), 80);
    }
  }, [open, initialData]);

  if (!open) return null;

  // ── Setters ──
  const setA =
    (k: keyof PatientFormAddValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setAddForm((p) => ({ ...p, [k]: e.target.value }));

  const setE =
    (k: keyof PatientFormValues) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      setEditForm((p) => ({ ...p, [k]: e.target.value }));

  // ── Submit ──
  const handleSubmit = async () => {
    if (isEdit) {
      const errs = validateUpdateForm(editForm);
      if (Object.keys(errs).length) {
        setEditErrors(errs);
        return;
      }
      const ok = await onEdit(editForm);
      if (ok) onClose();
    } else {
      const errs = validateAddForm(addForm);
      if (Object.keys(errs).length) {
        setAddErrors(errs);
        return;
      }
      const ok = await onAdd(addForm);
      if (ok) onClose();
    }
  };

  const avatarPreview = editForm.avatar
    ? URL.createObjectURL(editForm.avatar)
    : editForm.existingAvatar || null;

  const genderIcon = (g: string) =>
    g === "male" ? "👨" : g === "female" ? "👩" : "🧑";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`relative bg-white rounded-3xl shadow-2xl w-full animate-[fadeUp_0.25s_ease_both] overflow-hidden
        ${isEdit ? "max-w-xl" : "max-w-md"}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-primary to-brand-gradient px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-xl">
              👥
            </div>
            <div>
              <h2 className="font-poppins font-bold text-white text-[16px]">
                {isEdit ? "Edit Patient" : "Register Patient"}
              </h2>
              <p className="text-white/60 text-[11px]">
                {isEdit
                  ? "Update full patient profile"
                  : "Basic info to register patient"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* ══ ADD MODAL — 5 fields only ══ */}
        {!isEdit && (
          <div className="px-6 py-5 flex flex-col gap-4">
            {/* Info strip */}
            <div className="flex items-start gap-2.5 bg-brand-lighter border border-brand-primary/15 rounded-xl px-3 py-2.5">
              <span className="text-base mt-0.5">ℹ️</span>
              <p className="text-[12px] text-brand-primary font-medium leading-relaxed">
                Patient will be registered with basic details. Additional info
                like blood group, NFC card, height & weight can be updated after
                registration.
              </p>
            </div>

            <Field label="Full Name" required error={addErrors.name}>
              <input
                ref={firstRef}
                value={addForm.name}
                onChange={setA("name")}
                placeholder="e.g. Rohit Yadav"
                className={inputCls}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Email" required error={addErrors.email}>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={setA("email")}
                  placeholder="e.g. rohit@navhim.org"
                  className={inputCls}
                />
              </Field>
              <Field label="Phone" required error={addErrors.phone}>
                <input
                  type="tel"
                  value={addForm.phone}
                  onChange={setA("phone")}
                  placeholder="e.g. 9650224344"
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Date of Birth" required error={addErrors.dob}>
                <input
                  type="date"
                  value={addForm.dob}
                  onChange={setA("dob")}
                  className={inputCls}
                />
              </Field>
              <Field label="Gender" required error={addErrors.gender}>
                <select
                  value={addForm.gender}
                  onChange={setA("gender")}
                  className={inputCls}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </Field>
            </div>

            {/* Footer */}
            <div className="flex gap-3 justify-end pt-1 border-t border-brand-primary/[0.08] mt-1">
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
                Register Patient
              </button>
            </div>
          </div>
        )}

        {/* ══ EDIT MODAL — full profile ══ */}
        {isEdit && (
          <>
            <div className="px-6 py-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto scrollbar-hide">
              {/* Avatar */}
              <Field label="Profile Photo">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 border-dashed border-brand-primary/20 bg-surface flex items-center justify-center">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={userIcon}
                        alt="user"
                        className="w-8 h-8 object-contain opacity-40"
                      />
                    )}
                  </div>
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-brand-primary/30 hover:border-brand-primary hover:bg-brand-lighter transition-all">
                      <span>📷</span>
                      <span className="text-[12.5px] font-semibold text-gray-500 truncate">
                        {editForm.avatar
                          ? editForm.avatar.name
                          : editForm.existingAvatar
                            ? "Change photo"
                            : "Upload photo (JPG, PNG, WEBP)"}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          avatar: e.target.files?.[0] ?? null,
                        }))
                      }
                    />
                  </label>
                  {editForm.avatar && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditForm((p) => ({ ...p, avatar: null }))
                      }
                      className="w-8 h-8 rounded-lg bg-danger-bg text-danger flex items-center justify-center text-sm hover:bg-red-100 transition-colors flex-shrink-0"
                    >
                      ✕
                    </button>
                  )}
                  {!editForm.avatar && editForm.existingAvatar && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditForm((p) => ({ ...p, existingAvatar: "" }))
                      }
                      className="w-8 h-8 rounded-lg bg-danger-bg text-danger flex items-center justify-center text-sm hover:bg-red-100 transition-colors flex-shrink-0"
                    >
                      🗑
                    </button>
                  )}
                </div>
              </Field>

              {/* Name */}
              <Field label="Full Name" required error={editErrors.name}>
                <input
                  ref={firstRef}
                  value={editForm.name}
                  onChange={setE("name")}
                  placeholder="e.g. Rohit Yadav"
                  className={inputCls}
                />
              </Field>

              {/* Email + Phone */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Email" required error={editErrors.email}>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={setE("email")}
                    placeholder="e.g. rohit@navhim.org"
                    className={inputCls}
                  />
                </Field>
                <Field label="Phone" required error={editErrors.phone}>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={setE("phone")}
                    placeholder="e.g. 9650224344"
                    className={inputCls}
                  />
                </Field>
              </div>

              {/* DOB + Gender */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date of Birth" required error={editErrors.dob}>
                  <input
                    type="date"
                    value={editForm.dob}
                    onChange={setE("dob")}
                    className={inputCls}
                  />
                </Field>
                <Field label="Gender" required error={editErrors.gender}>
                  <select
                    value={editForm.gender}
                    onChange={setE("gender")}
                    className={inputCls}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
              </div>

              {/* Blood Group + NFC */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Blood Group">
                  <select
                    value={editForm.bloodGroup}
                    onChange={setE("bloodGroup")}
                    className={inputCls}
                  >
                    <option value="">Select blood group</option>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="NFC Card Number">
                  <input
                    type="text"
                    id="nfcCardNumber"
                    name="nfcCardNumber"
                    value={editForm.nfcCardNumber}
                    disabled
                    className={`${inputCls} bg-gray-50 text-gray-400 cursor-not-allowed border-dashed`}
                    placeholder="No NFC card assigned"
                  />
                </Field>
              </div>

              {/* Height + Weight */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Height (ft)">
                  <input
                    type="number"
                    value={editForm.height}
                    onChange={setE("height")}
                    placeholder="e.g. 6"
                    className={inputCls}
                    min={0}
                    step="0.1"
                  />
                </Field>
                <Field label="Weight (kg)">
                  <input
                    type="number"
                    value={editForm.weight}
                    onChange={setE("weight")}
                    placeholder="e.g. 70"
                    className={inputCls}
                    min={0}
                  />
                </Field>
              </div>

              {/* Emergency Contact */}
              <Field label="Emergency Contact">
                <input
                  type="tel"
                  value={editForm.emergencyContact}
                  onChange={setE("emergencyContact")}
                  placeholder="e.g. 9870306705"
                  className={inputCls}
                />
              </Field>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-brand-primary/10">
                <div>
                  <p className="text-[13px] font-bold text-navy">
                    Account Status
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Enable or disable patient account access
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditForm((p) => ({ ...p, isActive: !p.isActive }))
                  }
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none 
                    ${editForm.isActive ? "bg-success" : "bg-gray-200"}`}
                >
                  <span
                    className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 
                      ${editForm.isActive ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
              </div>

              {/* Location */}
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-semibold text-gray-500">
                  Location{" "}
                  <span className="text-gray-300 font-normal">(Optional)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="" error={editErrors.lat}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300 pointer-events-none">
                        LAT
                      </span>
                      <input
                        type="number"
                        step="any"
                        value={editForm.lat}
                        onChange={setE("lat")}
                        placeholder="e.g. 28.5600"
                        className={`${inputCls} pl-9`}
                      />
                    </div>
                  </Field>
                  <Field label="" error={editErrors.lng}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300 pointer-events-none">
                        LNG
                      </span>
                      <input
                        type="number"
                        step="any"
                        value={editForm.lng}
                        onChange={setE("lng")}
                        placeholder="e.g. 77.2116"
                        className={`${inputCls} pl-9`}
                      />
                    </div>
                  </Field>
                </div>
                {editForm.lat && editForm.lng && (
                  <a
                    href={`https://www.google.com/maps?q=${editForm.lat},${editForm.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[12px] font-semibold text-brand-primary hover:underline w-fit"
                  >
                    🗺️ Preview on Google Maps
                  </a>
                )}
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
                Save Changes
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
