import { useState, useEffect, useRef } from "react";
import { Doctor, DoctorFormValues } from "../types/doctor.types";
import {
  EMPTY_FORM,
  DAYS,
  validateDoctorForm,
  formFromDoctor,
  SLOT_SESSIONS,
} from "../helpers/doctorHelper";
import { SpinnerIcon } from "../../../components/Loader/Loader";

const inputCls =
  "w-full h-10 border border-black/10 rounded-xl px-3 text-[13px] font-medium text-navy " +
  "placeholder:text-gray-300 outline-none focus:border-brand-primary " +
  "focus:ring-2 focus:ring-brand-primary/10 transition-all bg-white";

/* ── Field ──────────────────────────────────────────────────────────── */
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

/* ── Slot Picker for one day ────────────────────────────────────────── */
function SlotPicker({
  day,
  selectedSlots,
  onToggle,
  onSelectAll,
  onClearAll,
}: {
  day: string;
  selectedSlots: string[];
  onToggle: (slot: string) => void;
  onSelectAll: (slots: string[]) => void;
  onClearAll: () => void;
}) {
  const allSlots = SLOT_SESSIONS.flatMap((s) => s.slots);
  const allSelected = allSlots.every((s) => selectedSlots.includes(s));

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[12.5px] font-bold text-navy capitalize">
          📅 {day} —{" "}
          <span className="text-brand-primary">
            {selectedSlots.length} slot{selectedSlots.length !== 1 ? "s" : ""}{" "}
            selected
          </span>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => (allSelected ? onClearAll() : onSelectAll(allSlots))}
            className="text-[11px] font-semibold text-brand-primary hover:underline"
          >
            {allSelected ? "Clear all" : "Select all"}
          </button>
        </div>
      </div>

      {/* Sessions */}
      {SLOT_SESSIONS.map((session) => {
        const sessionSelected = session.slots.filter((s) =>
          selectedSlots.includes(s),
        ).length;
        const allInSession = session.slots.every((s) =>
          selectedSlots.includes(s),
        );

        return (
          <div
            key={session.label}
            className={`rounded-xl border ${session.border} overflow-hidden`}
          >
            {/* Session header */}
            <div
              className={`flex items-center justify-between px-3 py-2 ${session.bg}`}
            >
              <p className={`text-[12px] font-bold ${session.color}`}>
                {session.icon} {session.label}
                {sessionSelected > 0 && (
                  <span className="ml-2 text-[11px] font-semibold bg-white/70 px-1.5 py-0.5 rounded-full">
                    {sessionSelected}/{session.slots.length}
                  </span>
                )}
              </p>
              <button
                type="button"
                onClick={() =>
                  allInSession
                    ? onSelectAll(
                        selectedSlots.filter((s) => !session.slots.includes(s)),
                      )
                    : onSelectAll([
                        ...new Set([...selectedSlots, ...session.slots]),
                      ])
                }
                className={`text-[11px] font-semibold ${session.color} hover:underline`}
              >
                {allInSession ? "Clear" : "All"}
              </button>
            </div>

            {/* Slot chips */}
            <div className="p-2.5 flex flex-wrap gap-1.5 bg-white">
              {session.slots.map((slot) => {
                const isSelected = selectedSlots.includes(slot);
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => onToggle(slot)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11.5px] font-semibold transition-all border
                      ${
                        isSelected
                          ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                          : "bg-surface text-gray-400 border-gray-100 hover:border-brand-primary/30 hover:text-brand-primary hover:bg-brand-lighter"
                      }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Props ──────────────────────────────────────────────────────────── */
interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: DoctorFormValues) => Promise<boolean>;
  initialData: Doctor | null;
  loading: boolean;
  specialties: { _id: string; name: string }[];
  hospitals: { _id: string; name: string }[];
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN MODAL
══════════════════════════════════════════════════════════════════════ */
export default function DoctorModal({
  open,
  onClose,
  onSubmit,
  initialData,
  loading,
  specialties,
  hospitals,
}: Props) {
  const [form, setForm] = useState<DoctorFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof DoctorFormValues, string>>
  >({});
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const firstRef = useRef<HTMLInputElement>(null);
  const isEdit = !!initialData;

  /* ── Reset on open ── */
  useEffect(() => {
    if (open) {
      setForm(initialData ? formFromDoctor(initialData) : EMPTY_FORM);
      setErrors({});
      setActiveDay(null);
      setTimeout(() => firstRef.current?.focus(), 80);
    }
  }, [open, initialData]);

  if (!open) return null;

  /* ── Field setter ── */
  const set =
    (k: keyof DoctorFormValues) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      setForm((p) => ({
        ...p,
        [k]:
          (e.target as HTMLInputElement).type === "checkbox"
            ? (e.target as HTMLInputElement).checked
            : e.target.value,
      }));

  /* ── Day chip toggle ── */
  const toggleDay = (day: string) => {
    const exists = form.availability.some((a) => a.day === day);
    if (exists) {
      setForm((p) => ({
        ...p,
        availability: p.availability.filter((a) => a.day !== day),
      }));
      if (activeDay === day) setActiveDay(null);
    } else {
      setForm((p) => ({
        ...p,
        availability: [...p.availability, { day, slots: [] }],
      }));
      setActiveDay(day);
    }
  };

  /* ── Slot toggle ── */
  const toggleSlot = (day: string, slot: string) => {
    setForm((p) => ({
      ...p,
      availability: p.availability.map((a) =>
        a.day === day
          ? {
              ...a,
              slots: a.slots.includes(slot)
                ? a.slots.filter((s) => s !== slot)
                : [...a.slots, slot],
            }
          : a,
      ),
    }));
  };

  /* ── Select / clear all slots for a day ── */
  const setDaySlots = (day: string, slots: string[]) => {
    setForm((p) => ({
      ...p,
      availability: p.availability.map((a) =>
        a.day === day ? { ...a, slots } : a,
      ),
    }));
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    const errs = validateDoctorForm(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    const ok = await onSubmit(form);
    if (ok) onClose();
  };

  const totalSlots = form.availability.reduce((s, a) => s + a.slots.length, 0);
  const activeDayData = form.availability.find((a) => a.day === activeDay);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl animate-[fadeUp_0.25s_ease_both] overflow-hidden">
        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-brand-primary to-brand-gradient px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-xl">
              🩺
            </div>
            <div>
              <h2 className="font-poppins font-bold text-white text-[16px]">
                {isEdit ? "Edit Doctor" : "Add New Doctor"}
              </h2>
              <p className="text-white/60 text-[11px]">
                {isEdit ? "Update doctor profile" : "Fill in the details below"}
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

        {/* ── Body ── */}
        <div className="px-6 py-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto scrollbar-hide">
          {/* Profile image */}
          <Field label="Profile Image">
            <div className="flex items-center gap-3">
              {/* Preview — new file takes priority, then existing URL */}
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 border-dashed border-brand-primary/20 bg-surface flex items-center justify-center">
                {form.profileImage ? (
                  <img
                    src={URL.createObjectURL(form.profileImage)}
                    alt="new preview"
                    className="w-full h-full object-cover"
                  />
                ) : form.existingProfileImage ? (
                  <img
                    src={form.existingProfileImage}
                    alt="current"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">🩺</span>
                )}
              </div>

              {/* Upload */}
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-brand-primary/30 hover:border-brand-primary hover:bg-brand-lighter transition-all">
                  <span>📷</span>
                  <span className="text-[12.5px] font-semibold text-gray-500 truncate">
                    {form.profileImage
                      ? form.profileImage.name
                      : form.existingProfileImage
                        ? "Change photo"
                        : "Upload photo (JPG, PNG, WEBP)"}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      profileImage: e.target.files?.[0] ?? null,
                    }))
                  }
                />
              </label>

              {/* Clear new file only — falls back to existing */}
              {form.profileImage && (
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, profileImage: null }))}
                  className="w-8 h-8 rounded-lg bg-danger-bg text-danger flex items-center justify-center text-sm hover:bg-red-100 transition-colors flex-shrink-0"
                  title="Remove new photo — keep existing"
                >
                  ✕
                </button>
              )}

              {/* Remove existing image entirely */}
              {!form.profileImage && form.existingProfileImage && (
                <button
                  type="button"
                  onClick={() =>
                    setForm((p) => ({ ...p, existingProfileImage: "" }))
                  }
                  className="w-8 h-8 rounded-lg bg-danger-bg text-danger flex items-center justify-center text-sm hover:bg-red-100 transition-colors flex-shrink-0"
                  title="Remove existing photo"
                >
                  🗑
                </button>
              )}
            </div>
          </Field>

          {/* Name */}
          <Field label="Full Name" required error={errors.name}>
            <input
              ref={firstRef}
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. Dr. Ashok Shah"
              className={inputCls}
            />
          </Field>

          {/* Specialization + Hospital */}
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Specialization"
              required
              error={errors.specializationId}
            >
              <select
                value={form.specializationId}
                onChange={set("specializationId")}
                className={inputCls}
              >
                <option value="">Select specialization</option>
                {specialties.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Hospital" required error={errors.hospitalId}>
              <select
                value={form.hospitalId}
                onChange={set("hospitalId")}
                className={inputCls}
              >
                <option value="">Select hospital</option>
                {hospitals.map((h) => (
                  <option key={h._id} value={h._id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Experience + Fee */}
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Experience (years)"
              required
              error={errors.experienceYears}
            >
              <input
                type="number"
                value={form.experienceYears}
                onChange={set("experienceYears")}
                placeholder="e.g. 10"
                className={inputCls}
                min={0}
              />
            </Field>
            <Field label="Consultation Fee (₹)" error={errors.consultationFee}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  value={form.consultationFee}
                  onChange={set("consultationFee")}
                  placeholder={form.isFree ? "Free" : "e.g. 300"}
                  disabled={form.isFree}
                  min={0}
                  className={`${inputCls} pl-7 ${form.isFree ? "opacity-40 cursor-not-allowed bg-gray-50" : ""}`}
                />
              </div>
            </Field>
          </div>

          {/* Free Consultation */}
          <div className="flex items-center justify-between bg-surface rounded-xl px-4 py-3">
            <div>
              <p className="text-[13px] font-semibold text-navy">
                Free Consultation
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {form.isFree
                  ? "Patients will not be charged"
                  : "Consultation fee will be applied"}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              {form.isFree && (
                <span className="text-[11px] font-bold text-green-600 bg-success-bg px-2.5 py-1 rounded-lg">
                  FREE
                </span>
              )}
              <div
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    isFree: !p.isFree,
                    consultationFee: !p.isFree ? "" : p.consultationFee,
                  }))
                }
                className={`relative rounded-full cursor-pointer transition-colors duration-200 flex-shrink-0 ${form.isFree ? "bg-brand-primary" : "bg-gray-200"}`}
                style={{ width: 36, height: 20 }}
              >
                <div
                  className={`absolute top-[3px] w-[14px] h-[14px] bg-white rounded-full shadow transition-transform duration-200 ${form.isFree ? "translate-x-[18px]" : "translate-x-[3px]"}`}
                />
              </div>
            </div>
          </div>

          {/* About */}
          <Field label="About">
            <textarea
              value={form.about}
              onChange={set("about")}
              placeholder="Brief description about the doctor…"
              className={`${inputCls} h-20 py-2.5 resize-none`}
            />
          </Field>

          {/* ── Availability ── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-semibold text-gray-500">
                Availability & Slots
              </p>
              {totalSlots > 0 && (
                <span className="text-[11.5px] font-semibold text-brand-primary bg-brand-lighter px-2.5 py-1 rounded-lg">
                  {totalSlots} slot{totalSlots !== 1 ? "s" : ""} ·{" "}
                  {form.availability.filter((a) => a.slots.length > 0).length}{" "}
                  day
                  {form.availability.filter((a) => a.slots.length > 0)
                    .length !== 1
                    ? "s"
                    : ""}
                </span>
              )}
            </div>

            {/* Day selector chips */}
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => {
                const avail = form.availability.find((a) => a.day === day);
                const isSelected = !!avail;
                const isActive = activeDay === day;
                const slotCount = avail?.slots.length ?? 0;

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      toggleDay(day);
                      if (!isActive && !isSelected) {
                      } else if (isSelected)
                        setActiveDay(isActive ? null : day);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold capitalize transition-all border
                      ${
                        isActive
                          ? "bg-navy text-white border-navy shadow-sm"
                          : isSelected
                            ? "bg-brand-primary text-white border-brand-primary"
                            : "bg-surface text-gray-400 border-transparent hover:border-brand-primary/30 hover:text-gray-600"
                      }`}
                  >
                    {day.slice(0, 3)}
                    {isSelected && slotCount > 0 && (
                      <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                        {slotCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Hint */}
            {form.availability.length === 0 && (
              <p className="text-[12px] text-gray-300 text-center py-2">
                Select days above to assign time slots
              </p>
            )}

            {/* Slot picker — shown for active day */}
            {activeDay && activeDayData && (
              <div className="border border-brand-primary/10 rounded-2xl p-4 bg-surface animate-[fadeUp_0.2s_ease_both]">
                <SlotPicker
                  day={activeDay}
                  selectedSlots={activeDayData.slots}
                  onToggle={(slot) => toggleSlot(activeDay, slot)}
                  onSelectAll={(slots) => setDaySlots(activeDay, slots)}
                  onClearAll={() => setDaySlots(activeDay, [])}
                />
              </div>
            )}

            {/* Summary — all days with their slots */}
            {form.availability.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {form.availability.map((avail) => (
                  <div
                    key={avail.day}
                    onClick={() =>
                      setActiveDay(activeDay === avail.day ? null : avail.day)
                    }
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all
                      ${
                        activeDay === avail.day
                          ? "bg-brand-lighter border-brand-primary/20"
                          : "bg-white border-gray-100 hover:border-brand-primary/15 hover:bg-surface"
                      }`}
                  >
                    {/* Day */}
                    <span className="text-[12px] font-bold text-navy capitalize min-w-[70px]">
                      {avail.day}
                    </span>

                    {/* Slot preview */}
                    <div className="flex flex-wrap gap-1 flex-1">
                      {avail.slots.length === 0 ? (
                        <span className="text-[11px] text-gray-300 italic">
                          No slots — click to add
                        </span>
                      ) : (
                        <>
                          {avail.slots.slice(0, 4).map((s) => (
                            <span
                              key={s}
                              className="text-[10.5px] bg-brand-lighter text-brand-primary font-semibold px-2 py-0.5 rounded-lg"
                            >
                              {s}
                            </span>
                          ))}
                          {avail.slots.length > 4 && (
                            <span className="text-[10.5px] bg-surface text-gray-400 font-semibold px-2 py-0.5 rounded-lg">
                              +{avail.slots.length - 4} more
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Remove day */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDay(avail.day);
                      }}
                      className="flex-shrink-0 w-6 h-6 rounded-lg text-gray-300 hover:text-danger hover:bg-danger-bg flex items-center justify-center transition-all text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Doctor */}
          <div className="flex items-center justify-between bg-surface rounded-xl px-4 py-3">
            <div>
              <p className="text-[13px] font-semibold text-navy">
                Active Doctor
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {form.isActive
                  ? "Visible to patients for booking"
                  : "Hidden from patient booking"}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${form.isActive ? "bg-success-bg text-green-700" : "bg-gray-100 text-gray-400"}`}
              >
                {form.isActive ? "Active" : "Inactive"}
              </span>
              <div
                onClick={() =>
                  setForm((p) => ({ ...p, isActive: !p.isActive }))
                }
                className={`relative rounded-full cursor-pointer transition-colors duration-200 flex-shrink-0 ${form.isActive ? "bg-brand-primary" : "bg-gray-200"}`}
                style={{ width: 36, height: 20 }}
              >
                <div
                  className={`absolute top-[3px] w-[14px] h-[14px] bg-white rounded-full shadow transition-transform duration-200 ${form.isActive ? "translate-x-[18px]" : "translate-x-[3px]"}`}
                />
              </div>
            </div>
          </div>
        </div>
        {/* end body */}

        {/* ── Footer ── */}
        <div className="px-6 pb-6 pt-4 flex items-center justify-between border-t border-brand-primary/[0.08]">
          <p className="text-[12px] text-gray-400 font-medium">
            {totalSlots > 0
              ? `📅 ${totalSlots} slot${totalSlots !== 1 ? "s" : ""} across ${form.availability.filter((a) => a.slots.length > 0).length} day${form.availability.filter((a) => a.slots.length > 0).length !== 1 ? "s" : ""}`
              : ""}
          </p>
          <div className="flex gap-3">
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
              {isEdit ? "Save Changes" : "Add Doctor"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
