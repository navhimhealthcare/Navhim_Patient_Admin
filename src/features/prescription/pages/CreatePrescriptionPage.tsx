import { useParams } from "react-router-dom";
import { useCreatePrescription } from "../hooks/useCreatePrescription";
import PrescriptionPdfTemplate from "../components/PrescriptionPdfTemplate";
import { TIME_OPTIONS, FREQUENCY_OPTIONS } from "../utils/prescriptionUtils";
import {
  DarkInput,
  DarkSelect,
  FieldLabel,
  SidebarSection,
} from "../../reports/components/FormFields";

export default function CreatePrescriptionPage() {
  const { patientId } = useParams<{ patientId: string }>();

  const {
    form,
    medicines,
    errors,
    doctors,
    isBusy,
    generating,
    medCount,
    completeness,
    templateRef,
    setField,
    handleDoctorChange,
    setMedField,
    toggleTime,
    addMedicine,
    removeMedicine,
    handleDownloadPreview,
    handleSubmit,
  } = useCreatePrescription(patientId);

  return (
    <div
      className="flex flex-col gap-0 h-screen overflow-hidden"
      style={{ marginTop: "-24px" }}
    >
      <div className="flex h-full overflow-hidden">
        {/* ── LEFT: Dark navy form sidebar ── */}
        <div
          className="flex flex-col overflow-hidden bg-navy flex-shrink-0"
          style={{ width: "450px" }}
        >
          {/* Sidebar header */}
          <div className="flex-shrink-0 px-6 pt-6 pb-5 border-b border-white/[0.07]">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => history.back()}
                className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/15 transition-all flex-shrink-0"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M8 2L4 6l4 4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div className="min-w-0">
                <h1 className="font-poppins font-black text-[17px] text-white tracking-tight leading-none">
                  Create Prescription
                </h1>
                <p className="text-[11px] text-white/30 mt-0.5 truncate">
                  Patient:{" "}
                  <span className="text-white/50 font-mono">
                    {patientId?.slice(-10)}
                  </span>
                </p>
              </div>
            </div>

            {/* Completeness bar */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  Completeness
                </span>
                <span
                  className={`text-[11px] font-black ${completeness === 100 ? "text-green-400" : "text-white/40"}`}
                >
                  {completeness}%
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${completeness === 100 ? "bg-green-400" : "bg-brand-light"}`}
                  style={{ width: `${completeness}%` }}
                />
              </div>
            </div>
          </div>

          {/* Scrollable body */}
          <div
            className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.1) transparent",
            }}
          >
            {/* ── Prescription Details ── */}
            <div>
              <SidebarSection
                icon={
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <rect
                      x="1.5"
                      y="1"
                      width="9"
                      height="10"
                      rx="1.5"
                      stroke="rgba(255,255,255,0.5)"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M3.5 4h5M3.5 6.5h5M3.5 9h3"
                      stroke="rgba(255,255,255,0.5)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                }
                title="Prescription Details"
              />
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <FieldLabel required>Patient Name</FieldLabel>
                  <DarkInput
                    value={form.patientName}
                    onChange={(e) => setField("patientName", e.target.value)}
                    placeholder="Full name"
                    error={errors.patientName}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <FieldLabel required>Doctor</FieldLabel>
                  <DarkSelect
                    value={form.doctorId}
                    onChange={(e) => handleDoctorChange(e.target.value)}
                    options={doctors.map((d) => ({
                      value: d._id,
                      label: d.name,
                    }))}
                    placeholder="Select doctor"
                    error={errors.doctorId}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <FieldLabel required>Diagnosis</FieldLabel>
                    <DarkInput
                      value={form.diagnosis}
                      onChange={(e) => setField("diagnosis", e.target.value)}
                      placeholder="e.g. Fever and cold"
                      error={errors.diagnosis}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <FieldLabel>Date</FieldLabel>
                    <DarkInput
                      type="date"
                      value={form.date}
                      onChange={(e) => setField("date", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-white/[0.06]" />

            {/* ── Medicines ── */}
            <div>
              <SidebarSection
                icon={
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M4 1h4v2H4V1zM2 3h8v1.5L9 10H3L2 4.5V3z"
                      stroke="rgba(255,255,255,0.5)"
                      strokeWidth="1.1"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
                title="Medicines"
                action={
                  <button
                    type="button"
                    onClick={addMedicine}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-primary/20 text-brand-light text-[11px] font-bold hover:bg-brand-primary/30 transition-colors border border-brand-primary/20"
                  >
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                      <path
                        d="M4.5 1v7M1 4.5h7"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    Add
                  </button>
                }
              />

              <div
                className="flex flex-col gap-4 max-h-[420px] overflow-y-auto -mr-1 pr-1"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(255,255,255,0.1) transparent",
                }}
              >
                {medicines.map((med, idx) => (
                  <div
                    key={idx}
                    className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2.5"
                  >
                    {/* Med header */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                        Medicine {idx + 1}
                      </span>
                      {medicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedicine(idx)}
                          className="w-5 h-5 rounded-lg bg-red-400/10 border border-red-400/20 flex items-center justify-center text-red-400 hover:bg-red-400/20 transition-all"
                        >
                          <svg
                            width="8"
                            height="8"
                            viewBox="0 0 8 8"
                            fill="none"
                          >
                            <path
                              d="M1 7L7 1M1 1l6 6"
                              stroke="currentColor"
                              strokeWidth="1.3"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Name + Dosage */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9.5px] font-bold text-white/40 uppercase tracking-widest">
                          Name *
                        </label>
                        <input
                          value={med.name}
                          onChange={(e) =>
                            setMedField(idx, "name", e.target.value)
                          }
                          placeholder="e.g. Paracetamol"
                          className={`h-8 px-2.5 rounded-lg text-[11.5px] font-medium text-white placeholder:text-white/20 outline-none bg-white/5 border transition-all
                            ${errors[`m_${idx}_name`] ? "border-red-400/50" : "border-white/10 focus:border-brand-light/40 hover:border-white/20"}`}
                        />
                        {errors[`m_${idx}_name`] && (
                          <p className="text-[9px] text-red-400">
                            {errors[`m_${idx}_name`]}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9.5px] font-bold text-white/40 uppercase tracking-widest">
                          Dosage *
                        </label>
                        <input
                          value={med.dosage}
                          onChange={(e) =>
                            setMedField(idx, "dosage", e.target.value)
                          }
                          placeholder="e.g. 500mg"
                          className={`h-8 px-2.5 rounded-lg text-[11.5px] font-medium text-white placeholder:text-white/20 outline-none bg-white/5 border transition-all
                            ${errors[`m_${idx}_dosage`] ? "border-red-400/50" : "border-white/10 focus:border-brand-light/40 hover:border-white/20"}`}
                        />
                        {errors[`m_${idx}_dosage`] && (
                          <p className="text-[9px] text-red-400">
                            {errors[`m_${idx}_dosage`]}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Frequency */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9.5px] font-bold text-white/40 uppercase tracking-widest">
                        Frequency *
                      </label>
                      <div className="relative">
                        <select
                          value={med.frequency}
                          onChange={(e) =>
                            setMedField(idx, "frequency", e.target.value)
                          }
                          className={`w-full h-8 pl-2.5 pr-7 rounded-lg text-[11.5px] font-medium appearance-none outline-none bg-white/5 border transition-all cursor-pointer
                            ${!med.frequency ? "text-white/25" : "text-white"}
                            ${errors[`m_${idx}_frequency`] ? "border-red-400/50" : "border-white/10 focus:border-brand-light/40 hover:border-white/20"}`}
                          style={{ colorScheme: "dark" }}
                        >
                          <option value="" disabled className="bg-[#111827] text-white">
                            Select frequency
                          </option>
                          {FREQUENCY_OPTIONS.map((f) => (
                            <option key={f} value={f} className="bg-[#111827] text-white">
                              {f}
                            </option>
                          ))}
                        </select>
                        <svg
                          className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                          width="9"
                          height="9"
                          viewBox="0 0 10 10"
                          fill="none"
                        >
                          <path
                            d="M2 3.5L5 6.5L8 3.5"
                            stroke="rgba(255,255,255,0.35)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      {errors[`m_${idx}_frequency`] && (
                        <p className="text-[9px] text-red-400">
                          {errors[`m_${idx}_frequency`]}
                        </p>
                      )}
                    </div>

                    {/* Times toggle */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9.5px] font-bold text-white/40 uppercase tracking-widest">
                        Timing *
                      </label>
                      <div className="flex gap-1.5 flex-wrap">
                        {TIME_OPTIONS.map((t) => {
                          const active = med.times.includes(t);
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => toggleTime(idx, t)}
                              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold capitalize transition-all border
                                ${
                                  active
                                    ? "bg-brand-primary/30 text-brand-light border-brand-primary/40"
                                    : "bg-white/5 text-white/35 border-white/10 hover:border-white/25 hover:text-white/60"
                                }`}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                      {errors[`m_${idx}_times`] && (
                        <p className="text-[9px] text-red-400">
                          {errors[`m_${idx}_times`]}
                        </p>
                      )}
                    </div>

                    {/* Start / End dates */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9.5px] font-bold text-white/40 uppercase tracking-widest">
                          Start Date *
                        </label>
                        <input
                          type="date"
                          value={med.startDate}
                          onChange={(e) =>
                            setMedField(idx, "startDate", e.target.value)
                          }
                          className={`h-8 px-2.5 rounded-lg text-[11px] font-medium text-white outline-none bg-white/5 border transition-all cursor-pointer
                            ${errors[`m_${idx}_startDate`] ? "border-red-400/50" : "border-white/10 focus:border-brand-light/40 hover:border-white/20"}`}
                          style={{ colorScheme: "dark" }}
                        />
                        {errors[`m_${idx}_startDate`] && (
                          <p className="text-[9px] text-red-400">
                            {errors[`m_${idx}_startDate`]}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9.5px] font-bold text-white/40 uppercase tracking-widest">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={med.endDate}
                          onChange={(e) =>
                            setMedField(idx, "endDate", e.target.value)
                          }
                          className="h-8 px-2.5 rounded-lg text-[11px] font-medium text-white outline-none bg-white/5 border border-white/10 focus:border-brand-light/40 hover:border-white/20 transition-all cursor-pointer"
                          style={{ colorScheme: "dark" }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-4" />
          </div>

          {/* Sidebar footer */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-white/[0.07] bg-[#0A1228] flex flex-col gap-2.5">
            <div className="flex items-center gap-3 text-[11px] text-white/30">
              <span>
                <span className="font-bold text-white/50">{medCount}</span>{" "}
                medicine{medCount !== 1 ? "s" : ""}
              </span>
            </div>
            <button
              onClick={handleDownloadPreview}
              disabled={isBusy}
              className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-white/8 border border-white/10 text-[13px] font-semibold text-white/60 hover:bg-white/12 hover:text-white transition-all disabled:opacity-40"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path
                  d="M6.5 1v7M4 5.5l2.5 2.5L9 5.5M2 10.5h9"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Download Preview
            </button>
            <button
              onClick={handleSubmit}
              disabled={isBusy}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-[13.5px] font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isBusy
                  ? "rgba(75,105,255,0.4)"
                  : "linear-gradient(135deg, #4B69FF 0%, #2D3F99 100%)",
              }}
            >
              {isBusy ? (
                <>
                  <svg
                    className="animate-spin"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <path
                      d="M12 7A5 5 0 112 7"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                  {generating ? "Generating PDF…" : "Submitting…"}
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2 7l4 4 6-6"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Submit Prescription
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── RIGHT: Live PDF preview ── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#F0F2F8]">
          {/* Preview header */}
          <div className="flex-shrink-0 flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-40" />
              </div>
              <span className="text-[12.5px] font-bold text-navy">
                Live Preview
              </span>
              <div className="h-4 w-px bg-gray-200" />
              <span className="text-[11.5px] text-gray-400">
                Updates as you type
              </span>
            </div>
            <div className="flex items-center gap-2">
              {[
                { label: "A4 Portrait", color: "text-gray-500" },
                {
                  label: `${medCount} medicine${medCount !== 1 ? "s" : ""}`,
                  color: medCount > 0 ? "text-brand-primary" : "text-gray-300",
                },
              ].map((chip, i) => (
                <span
                  key={i}
                  className={`text-[11px] font-semibold bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full ${chip.color}`}
                >
                  {chip.label}
                </span>
              ))}
            </div>
          </div>

          {/* PDF canvas */}
          <div
            className="flex-1 overflow-auto p-6 flex items-start justify-center"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#d1d5db transparent",
            }}
          >
            <div className="relative" style={{ width: "572px", flexShrink: 0 }}>
              <div
                className="absolute inset-0 translate-y-2 translate-x-1 rounded-sm bg-black/8"
                style={{ filter: "blur(8px)" }}
              />
              <div className="absolute inset-0 translate-y-1 rounded-sm bg-black/5" />
              <div
                className="relative bg-white rounded-sm overflow-hidden border border-gray-200/50"
                style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
              >
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-300" />
                    <div className="w-3 h-3 rounded-full bg-yellow-300" />
                    <div className="w-3 h-3 rounded-full bg-green-300" />
                  </div>
                  <span className="text-[10px] font-medium text-gray-400 font-mono">
                    NavhimPrescription.pdf — Page 1
                  </span>
                  <div className="w-16" />
                </div>
                <div
                  style={{
                    transform: "scale(0.72)",
                    transformOrigin: "top left",
                    width: "794px",
                    pointerEvents: "none",
                  }}
                >
                  <PrescriptionPdfTemplate
                    form={form}
                    medicines={medicines}
                    innerRef={{ current: null }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-center mt-3 gap-2">
                <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-white">1</span>
                </div>
                <span className="text-[11px] text-gray-400">of 1 page</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden full-size template for html2canvas */}
      <div
        style={{
          position: "fixed",
          top: "-9999px",
          left: "-9999px",
          zIndex: -1,
          pointerEvents: "none",
        }}
      >
        <PrescriptionPdfTemplate
          form={form}
          medicines={medicines}
          innerRef={templateRef}
        />
      </div>
    </div>
  );
}
