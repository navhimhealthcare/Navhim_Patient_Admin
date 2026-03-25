import { useParams } from "react-router-dom";
import { useLabReport } from "../hooks/useLabReport";
import PdfTemplate from "../components/PdfTemplate";
import PdfPreviewPanel from "../components/PdfPreviewPanel";
import SignaturePanel from "../components/SignaturePanel";
import VoiceNoteButton from "../components/VoiceNoteButton";
import ParameterRows from "../components/ParameterRows";
import {
  FieldLabel,
  DarkInput,
  DarkSelect,
  SidebarSection,
} from "../components/FormFields";

export default function NavhimLabReportGenerator() {
  const { patientId } = useParams<{ patientId: string }>();

  const {
    form,
    results,
    errors,
    doctors,
    signature,
    interimText,
    isBusy,
    generating,
    paramCount,
    abnormalCount,
    completeness,
    templateRef,
    setField,
    setResult,
    addRow,
    removeRow,
    addQuick,
    handleDoctorChange,
    handleVoiceTranscript,
    setInterimText,
    setSignature,
    handleDownloadPreview,
    handleSubmit,
  } = useLabReport(patientId);

  return (
    <div
      className="flex flex-col gap-0 h-screen overflow-hidden"
      style={{ marginTop: "-24px" }}
    >
      <div className="flex h-full overflow-hidden">
        {/* ── LEFT: Dark navy form sidebar ── */}
        <div
          className="flex flex-col overflow-hidden bg-navy flex-shrink-0"
          style={{ width: "560px" }}
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
                  Create Lab Report
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

          {/* Scrollable form body */}
          <div
            className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.1) transparent",
            }}
          >
            {/* Report Details */}
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
                title="Report Details"
              />
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <FieldLabel required>Patient Name</FieldLabel>
                  <DarkInput
                    value={form.patientName}
                    onChange={(e) => setField("patientName", e.target.value)}
                    placeholder="Full name of the patient"
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
                    placeholder="Select attending doctor"
                    error={errors.doctorId}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <FieldLabel required>Test Name</FieldLabel>
                    <DarkInput
                      value={form.testName}
                      onChange={(e) => setField("testName", e.target.value)}
                      placeholder="e.g. CBC"
                      error={errors.testName}
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

            {/* Parameters */}
            <ParameterRows
              results={results}
              errors={errors}
              onAdd={addRow}
              onRemove={removeRow}
              onChange={setResult}
              onQuick={addQuick}
            />

            <div className="h-px bg-white/[0.06]" />

            {/* Doctor's Note */}
            <div>
              <SidebarSection
                icon={
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 8.5c1.5-3 3-5.5 4-5.5s1 1.5 1.5 1.5S9 1 10 1"
                      stroke="rgba(255,255,255,0.5)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                }
                title="Doctor's Note *"
                action={
                  <VoiceNoteButton
                    onTranscript={handleVoiceTranscript}
                    onInterim={setInterimText}
                  />
                }
              />
              <div className="flex flex-col gap-1.5">
                <textarea
                  value={form.note}
                  onChange={(e) => setField("note", e.target.value)}
                  placeholder="Add clinical observations, follow-up instructions…"
                  rows={3}
                  className={`w-full px-3 py-2.5 rounded-xl text-[12px] font-medium text-white placeholder:text-white/20 outline-none resize-none transition-all bg-white/5 border leading-relaxed
                    ${errors.note ? "border-red-400/50 focus:border-red-400/80" : "border-white/10 focus:border-brand-light/40 hover:border-white/20"}`}
                  style={{ colorScheme: "dark" }}
                />
                {errors.note && (
                  <p className="text-[10.5px] text-red-400">{errors.note}</p>
                )}
                {interimText && (
                  <div className="px-3 py-2 rounded-xl bg-red-400/10 border border-red-400/20 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse flex-shrink-0 mt-1" />
                    <p className="text-[11px] text-red-400 italic leading-relaxed">
                      {interimText}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="h-px bg-white/[0.06]" />

            {/* Signature */}
            <div>
              <SidebarSection
                icon={
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M1.5 9c2-4 3.5-7 4.5-7s1 2 1.5 2 2-2.5 3-2.5"
                      stroke="rgba(255,255,255,0.5)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
                title="Authorized Signature"
              />
              <SignaturePanel signature={signature} onChange={setSignature} />
              <p className="text-[9.5px] text-white/20 mt-2 leading-relaxed">
                Saved in your browser. Appears on all generated reports.
              </p>
            </div>

            <div className="h-4" />
          </div>

          {/* Sidebar footer — action buttons */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-white/[0.07] bg-[#0A1228] flex flex-col gap-2.5">
            <div className="flex items-center gap-3 text-[11px] text-white/30">
              <span>
                <span className="font-bold text-white/50">{paramCount}</span>{" "}
                params
              </span>
              {abnormalCount > 0 && (
                <span className="flex items-center gap-1 text-red-400/70">
                  <span className="w-1 h-1 rounded-full bg-red-400" />
                  {abnormalCount} abnormal
                </span>
              )}
              <span
                className={signature ? "text-green-400/70" : "text-white/20"}
              >
                {signature ? "✓ Signed" : "No sig"}
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
                  Submit Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── RIGHT: PDF preview ── */}
        <PdfPreviewPanel
          form={form}
          results={results}
          signature={signature}
          paramCount={paramCount}
          abnormalCount={abnormalCount}
        />
      </div>

      {/* Hidden full-size template captured by html2canvas */}
      <div
        style={{
          position: "fixed",
          top: "-9999px",
          left: "-9999px",
          zIndex: -1,
          pointerEvents: "none",
        }}
      >
        <PdfTemplate
          form={form}
          results={results}
          signature={signature}
          innerRef={templateRef}
        />
      </div>
    </div>
  );
}
