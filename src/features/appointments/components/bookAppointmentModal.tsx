import { useState, useEffect, useMemo } from "react";
import {
  AppointmentCreateForm,
  AppointmentMode,
} from "../types/appointment.types";
import SlotPicker from "./SlotPicker";
import { SpinnerIcon } from "../../../components/Loader/Loader";

const inputCls =
  "w-full h-10 border border-black/10 rounded-xl px-3 text-[13px] font-medium text-navy " +
  "placeholder:text-gray-300 outline-none focus:border-brand-primary " +
  "focus:ring-2 focus:ring-brand-primary/10 transition-all bg-white";

const EMPTY: AppointmentCreateForm = {
  patientId: "",
  doctorId: "",
  hospitalId: "",
  appointmentDate: "",
  slot: "",
  reason: "",
  mode: "Online",
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: AppointmentCreateForm) => Promise<boolean>;
  loading: boolean;
  patients: { _id: string; name: string; phone: string }[];
  doctors: {
    _id: string;
    name: string;
    specialization: string;
    profileImage?: string;
    hospital: { _id: string; name: string };
  }[];
  hospitals: { _id: string; name: string; address: string }[];
}

const STEPS = [
  { label: "Patient & Doctor", icon: "👥" },
  { label: "Date & Slot", icon: "📅" },
  { label: "Confirm", icon: "✅" },
];

export default function BookAppointmentModal({
  open,
  onClose,
  onSubmit,
  loading,
  patients,
  doctors,
  hospitals,
}: Props) {
  const [form, setForm] = useState<AppointmentCreateForm>(EMPTY);
  const [errors, setErrors] = useState<
    Partial<Record<keyof AppointmentCreateForm, string>>
  >({});
  const [step, setStep] = useState(1);

  const selectedDoctor = doctors.find((d) => d._id === form.doctorId);
  const selectedPatient = patients.find((p) => p._id === form.patientId);
  const selectedHospital = hospitals.find((h) => h._id === form.hospitalId);

  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      setErrors({});
      setStep(1);
    }
  }, [open]);

  // Filter doctors by selected hospital
  const filteredDoctors = useMemo(() => {
    if (!form.hospitalId) return [];
    return doctors.filter((d) => {
      // Handle both cases where hospital might be an object with _id or just a string ID
      const docHospitalId =
        typeof d.hospital === "object" ? d.hospital._id : d.hospital;
      return docHospitalId === form.hospitalId;
    });
  }, [doctors, form.hospitalId]);

  // Clear doctor if it's not in the filtered list
  useEffect(() => {
    if (
      form.doctorId &&
      !filteredDoctors.some((d) => d._id === form.doctorId)
    ) {
      setForm((p) => ({ ...p, doctorId: "" }));
    }
  }, [form.hospitalId, filteredDoctors]);

  if (!open) return null;

  const set =
    (k: keyof AppointmentCreateForm) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const nextStep = () => {
    const e: Partial<Record<keyof AppointmentCreateForm, string>> = {};
    if (step === 1) {
      if (!form.patientId) e.patientId = "Required";
      if (!form.doctorId) e.doctorId = "Required";
      if (!form.hospitalId) e.hospitalId = "Required";
    }
    if (step === 2) {
      if (!form.appointmentDate) e.appointmentDate = "Required";
      if (!form.slot) e.slot = "Select a time slot";
    }
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!form.reason.trim()) {
      setErrors({ reason: "Required" });
      return;
    }
    const ok = await onSubmit(form);
    if (ok) onClose();
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-[fadeUp_0.25s_ease_both] overflow-hidden">
        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-brand-primary to-brand-gradient px-6 pt-5 pb-0">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-lg">
                📅
              </div>
              <div>
                <h2 className="font-poppins font-bold text-white text-[16px]">
                  Book Appointment
                </h2>
                <p className="text-white/60 text-[11px]">
                  Step {step} of {STEPS.length}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-sm"
            >
              ✕
            </button>
          </div>

          {/* Step tabs */}
          <div className="flex">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[12px] font-semibold border-b-2 transition-all
                  ${
                    i + 1 === step
                      ? "border-white text-white"
                      : i + 1 < step
                        ? "border-white/40 text-white/60 cursor-pointer"
                        : "border-transparent text-white/30"
                  }`}
                onClick={() => i + 1 < step && setStep(i + 1)}
              >
                <span>{s.icon}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5 flex flex-col gap-4 max-h-[58vh] overflow-y-auto scrollbar-hide">
          {/* Step 1 ── Patient & Doctor */}
          {step === 1 && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-gray-500">
                  Patient <span className="text-danger">*</span>
                </label>
                <select
                  value={form.patientId}
                  onChange={set("patientId")}
                  className={inputCls}
                >
                  <option value="">Select patient</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} · {p.phone}
                    </option>
                  ))}
                </select>
                {errors.patientId && (
                  <p className="text-[11px] text-danger">{errors.patientId}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-gray-500">
                  Hospital <span className="text-danger">*</span>
                </label>
                <select
                  value={form.hospitalId}
                  onChange={set("hospitalId")}
                  className={inputCls}
                >
                  <option value="">Select hospital</option>
                  {hospitals.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name} — {h.address}
                    </option>
                  ))}
                </select>
                {errors.hospitalId && (
                  <p className="text-[11px] text-danger">{errors.hospitalId}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-gray-500">
                  Doctor <span className="text-danger">*</span>
                </label>
                <select
                  value={form.doctorId}
                  onChange={set("doctorId")}
                  className={inputCls}
                  disabled={!form.hospitalId}
                >
                  <option value="">
                    {form.hospitalId
                      ? "Select doctor"
                      : "Select a hospital first"}
                  </option>
                  {filteredDoctors.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} — {d.specialization}
                    </option>
                  ))}
                </select>
                {errors.doctorId && (
                  <p className="text-[11px] text-danger">{errors.doctorId}</p>
                )}

                {/* Selected doctor card */}
                {selectedDoctor && (
                  <div className="flex items-center gap-3 mt-1 bg-brand-lighter border border-brand-primary/15 rounded-xl px-3 py-2.5">
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-white flex-shrink-0 border border-brand-primary/10">
                      {selectedDoctor.profileImage ? (
                        <img
                          src={selectedDoctor.profileImage}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">
                          👨‍⚕️
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[12.5px] font-bold text-navy">
                        {selectedDoctor.name}
                      </p>
                      <p className="text-[11px] text-brand-primary font-medium">
                        {selectedDoctor.specialization}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mode */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-gray-500">
                  Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["Online", "In_Clinic"] as AppointmentMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, mode: m }))}
                      className={`h-10 rounded-xl text-[13px] font-semibold border-2 flex items-center justify-center gap-2 transition-all
                        ${
                          form.mode === m
                            ? "border-brand-primary bg-brand-primary text-white shadow-sm"
                            : "border-gray-200 text-gray-500 hover:border-brand-primary/30 bg-white"
                        }`}
                    >
                      {m === "Online" ? "💻" : "🏥"} {m.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 2 ── Date & Slot */}
          {step === 2 && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-gray-500">
                  Appointment Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  value={form.appointmentDate}
                  min={today}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      appointmentDate: e.target.value,
                      slot: "",
                    }))
                  }
                  className={inputCls}
                />
                {errors.appointmentDate && (
                  <p className="text-[11px] text-danger">
                    {errors.appointmentDate}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-gray-500">
                  Time Slot <span className="text-danger">*</span>
                </label>
                <SlotPicker
                  doctorId={form.doctorId}
                  date={form.appointmentDate}
                  selected={form.slot}
                  onSelect={(slot) => setForm((p) => ({ ...p, slot }))}
                  accentColor="brand"
                />
                {errors.slot && (
                  <p className="text-[11px] text-danger mt-1">{errors.slot}</p>
                )}
              </div>
            </>
          )}

          {/* Step 3 ── Confirm */}
          {step === 3 && (
            <>
              {/* Summary card */}
              <div className="bg-gradient-to-br from-brand-lighter to-surface border border-brand-primary/15 rounded-2xl p-4 flex flex-col gap-3">
                <p className="text-[11px] font-bold text-brand-primary uppercase tracking-widest">
                  Booking Summary
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { k: "👤 Patient", v: selectedPatient?.name ?? "—" },
                    { k: "👨‍⚕️ Doctor", v: selectedDoctor?.name ?? "—" },
                    { k: "🏥 Hospital", v: selectedHospital?.name ?? "—" },
                    { k: "📅 Date", v: form.appointmentDate },
                    { k: "🕐 Slot", v: form.slot },
                    { k: "💻 Mode", v: form.mode },
                  ].map(({ k, v }) => (
                    <div key={k} className="bg-white/70 rounded-xl px-3 py-2">
                      <p className="text-[10.5px] text-gray-400 font-medium">
                        {k}
                      </p>
                      <p className="text-[12.5px] font-bold text-navy mt-0.5 truncate">
                        {v}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-gray-500">
                  Reason for Visit <span className="text-danger">*</span>
                </label>
                <textarea
                  value={form.reason}
                  onChange={set("reason")}
                  rows={3}
                  placeholder="Describe symptoms or reason for this appointment…"
                  className="w-full border border-black/10 rounded-xl px-3 py-2.5 text-[13px] font-medium text-navy placeholder:text-gray-300 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all bg-white resize-none"
                />
                {errors.reason && (
                  <p className="text-[11px] text-danger">{errors.reason}</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 pb-5 pt-4 flex items-center justify-between border-t border-black/[0.05]">
          <button
            onClick={step > 1 ? () => setStep((s) => s - 1) : onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-500 hover:bg-surface transition-colors disabled:opacity-50"
          >
            {step > 1 ? "← Back" : "Cancel"}
          </button>

          {step < 3 ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-gradient text-white text-[13px] font-semibold shadow-btn hover:opacity-90 transition-opacity"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-gradient text-white text-[13px] font-semibold shadow-btn hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {loading && <SpinnerIcon size="sm" color="white" />}
              📅 Confirm Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
