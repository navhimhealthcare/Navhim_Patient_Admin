import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  usePatientReports,
  EMPTY_REPORT_FILTER,
} from "../hooks/usePatientReports";
import {
  PatientReport,
  ReportResult,
  CreateReportPayload,
} from "../types/report.types";
import { SectionLoader } from "../../../components/Loader/Loader";
import CreateReportModal from "../components/createReportModal";
import axiosInstance from "../../../services/axiosConfig";
import { patientService } from "../../patients/services/patientService";

// ── Helpers ───────────────────────────────────────────────────────────────
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

// Determine if a result value is outside normal range (basic heuristic)
const isAbnormal = (r: ReportResult): boolean => {
  try {
    const val = parseFloat(r.value);
    const match = r.normalRange.match(/([\d.]+)\s*[-–]\s*([\d.]+)/);
    if (!match || isNaN(val)) return false;
    return val < parseFloat(match[1]) || val > parseFloat(match[2]);
  } catch {
    return false;
  }
};

// ── Result row ────────────────────────────────────────────────────────────
function ResultRow({ result, idx }: { result: ReportResult; idx: number }) {
  const abnormal = isAbnormal(result);
  return (
    <tr
      className={`border-b border-gray-50 last:border-0 transition-colors
      ${abnormal ? "bg-red-50/40 hover:bg-red-50/70" : "hover:bg-gray-50/60"}`}
    >
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-lg bg-brand-lighter text-brand-primary text-[10px] font-black flex items-center justify-center flex-shrink-0">
            {idx + 1}
          </span>
          <span className="text-[13px] font-semibold text-navy">
            {result.name}
          </span>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12.5px] font-bold
          ${abnormal ? "bg-red-100 text-red-600" : "bg-green-50 text-green-600"}`}
        >
          {abnormal && (
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path
                d="M5.5 1L10 9.5H1L5.5 1Z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
              <path
                d="M5.5 4.5v2M5.5 7.5v.5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
          )}
          {result.value}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <span className="text-[12px] text-gray-400 font-medium bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
          {result.normalRange || "—"}
        </span>
      </td>
      <td className="px-5 py-3.5">
        {abnormal ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-black text-red-500 bg-red-50 px-2.5 py-1 rounded-full">
            ⚠ Abnormal
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-black text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
            ✓ Normal
          </span>
        )}
      </td>
    </tr>
  );
}

// ── Report card ───────────────────────────────────────────────────────────
function ReportCard({ report }: { report: PatientReport }) {
  const [expanded, setExpanded] = useState(true);
  const abnormalCount = report.results.filter(isAbnormal).length;
  const hasAbnormal = abnormalCount > 0;

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-200
      ${hasAbnormal ? "border-red-100" : "border-gray-100"}`}
    >
      {/* Card header */}
      <div
        className={`flex items-center gap-4 px-5 py-4 cursor-pointer select-none
          ${hasAbnormal ? "bg-red-50/30" : "bg-gray-50/50"} hover:bg-gray-50 transition-colors`}
        onClick={() => setExpanded((e) => !e)}
      >
        {/* Icon */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
          ${hasAbnormal ? "bg-red-100" : "bg-brand-lighter"}`}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect
              x="3"
              y="2"
              width="14"
              height="16"
              rx="2"
              stroke={hasAbnormal ? "#DC2626" : "#4B69FF"}
              strokeWidth="1.5"
            />
            <path
              d="M6 6h8M6 10h8M6 14h5"
              stroke={hasAbnormal ? "#DC2626" : "#4B69FF"}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Test name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-poppins font-bold text-[14.5px] text-navy">
              {report.testName}
            </h3>
            {hasAbnormal && (
              <span className="text-[10.5px] font-black text-red-500 bg-red-100 px-2 py-0.5 rounded-full">
                {abnormalCount} abnormal
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-[11.5px] text-gray-400">
              {fmtDate(report.createdAt)} · {fmtTime(report.createdAt)}
            </span>
            <span className="text-[11px] text-gray-300">·</span>
            <span className="text-[11.5px] text-gray-400">
              {report.results.length} parameter
              {report.results.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div
          className="flex items-center gap-2 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {report.pdfUrl && (
            <a
              href={report.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-lighter text-brand-primary text-[12px] font-bold hover:bg-brand-soft transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path
                  d="M6.5 1v8M3.5 6l3 3 3-3M2 11h9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              PDF
            </a>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className="w-8 h-8 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-navy flex items-center justify-center transition-all"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            >
              <path
                d="M2 4l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div>
          {/* Results table */}
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {["Parameter", "Value", "Normal Range", "Status"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-2.5 text-left text-[10.5px] font-black uppercase tracking-widest text-gray-300"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.results.map((r, i) => (
                <ResultRow key={r._id} result={r} idx={i} />
              ))}
            </tbody>
          </table>

          {/* Note */}
          {report.note && (
            <div className="mx-5 mb-4 mt-3 flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="flex-shrink-0 mt-0.5"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="7"
                  stroke="#D97706"
                  strokeWidth="1.3"
                />
                <path
                  d="M8 5v3.5M8 10v.5"
                  stroke="#D97706"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <div>
                <p className="text-[10.5px] font-black uppercase tracking-widest text-amber-600 mb-0.5">
                  Doctor's Note
                </p>
                <p className="text-[12.5px] text-amber-800 font-medium leading-relaxed">
                  {report.note}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function PatientReportPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const {
    reports,
    loading,
    actionLoading,
    filter,
    updateFilter,
    createReport,
    refresh,
  } = usePatientReports(patientId ?? "");

  const [modalOpen, setModalOpen] = useState(false);
  const [doctors, setDoctors] = useState<{ _id: string; name: string }[]>([]);
  const [patients, setPatients] = useState<{ _id: string; name: string }[]>([]);
  const [fetchingPatients, setFetchingPatients] = useState(false);

  // Fetch doctors for the select dropdown
  useEffect(() => {
    axiosInstance
      .get("/doctors/filter")
      .then((res) => {
        const list = res.data?.data ?? res.data ?? [];
        setDoctors(list.map((d: any) => ({ _id: d._id, name: d.name })));
      })
      .catch(() => {}); // silent — modal still works if empty
  }, []);

  // Fetch patients for the "Change Patient" dropdown
  useEffect(() => {
    setFetchingPatients(true);
    patientService
      .getAll()
      .then((res) => {
        const data = res.data as any;
        const list = Array.isArray(data) ? data : data?.data || [];
        setPatients(list.map((p: any) => ({ _id: p._id, name: p.name })));
      })
      .catch(() => {})
      .finally(() => setFetchingPatients(false));
  }, []);

  const handleCreate = async (payload: CreateReportPayload) => {
    return await createReport(payload);
  };

  const hasFilters = filter.fromDate || filter.toDate;
  const totalAbnormal = reports.reduce(
    (sum, r) => sum + r.results.filter(isAbnormal).length,
    0,
  );

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* ══ HEADER ═══════════════════════════════════════════════════════ */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-navy hover:border-gray-300 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M9 2L4 7l5 5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div>
            <h1 className="font-poppins font-black text-[28px] text-navy tracking-tight leading-none">
              Patient Reports
            </h1>
            <p className="text-[13.5px] text-gray-400 font-medium mt-1">
              Lab test results and medical reports
              {patientId && (
                <span className="ml-2 font-mono text-[11px] text-gray-300 bg-gray-100 px-2 py-0.5 rounded-lg">
                  ID: {patientId.slice(-8)}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-[13px] font-semibold text-gray-500 hover:text-navy hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className={loading ? "animate-spin" : ""}
            >
              <path
                d="M12 7A5 5 0 112 7M12 7V4M12 7h-3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Refresh
          </button>
          {/* <button onClick={() => navigate(`/app/patients/${patientId}/create-report`)} */}
          <button
            onClick={() => navigate(`/app/patients/${patientId}/create-report`)}
            // <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-brand-primary to-brand-gradient text-white text-[13.5px] font-bold shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 1v12M1 7h12"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            Add Report
          </button>
        </div>
      </div>

      {/* ══ STAT CARDS ═══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Total Reports",
            val: reports.length,
            sub: "All lab reports",
            icon: (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect
                  x="3"
                  y="2"
                  width="16"
                  height="18"
                  rx="2"
                  stroke="#4B69FF"
                  strokeWidth="1.5"
                />
                <path
                  d="M7 7h8M7 11h8M7 15h5"
                  stroke="#4B69FF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            ),
            bg: "bg-[#EEF1FF]",
            valColor: "text-[#4B69FF]",
          },
          {
            label: "Total Tests",
            val: reports.reduce((s, r) => s + r.results.length, 0),
            sub: "Parameters tested",
            icon: (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path
                  d="M8 3v6l-3 7h12l-3-7V3M7 3h8"
                  stroke="#2563EB"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ),
            bg: "bg-blue-50",
            valColor: "text-blue-600",
          },
          {
            label: "Abnormal",
            val: totalAbnormal,
            sub: "Need attention",
            icon: (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path
                  d="M11 3L19.5 18H2.5L11 3Z"
                  stroke="#DC2626"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M11 9v4M11 15v.5"
                  stroke="#DC2626"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            ),
            bg: "bg-red-50",
            valColor: "text-red-600",
          },
          {
            label: "With PDF",
            val: reports.filter((r) => r.pdfUrl).length,
            sub: "Downloadable",
            icon: (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect
                  x="3"
                  y="2"
                  width="16"
                  height="18"
                  rx="2"
                  stroke="#16A34A"
                  strokeWidth="1.5"
                />
                <path
                  d="M11 7v6M8 10l3 3 3-3M7 17h8"
                  stroke="#16A34A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ),
            bg: "bg-green-50",
            valColor: "text-green-600",
          },
        ].map((s, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-transparent ${s.bg}`}
          >
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
              {s.icon}
            </div>
            <div>
              <p
                className={`font-poppins font-black text-[26px] leading-none tracking-tight ${s.valColor}`}
              >
                {s.val}
              </p>
              <p className="text-[12px] font-bold text-gray-500 mt-1 leading-tight">
                {s.label}
              </p>
              <p className="text-[10.5px] text-gray-300 mt-0.5 leading-tight">
                {s.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ══ CHANGE PATIENT FILTER ═══════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-lighter flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4B69FF"
                strokeWidth="2"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-bold text-navy">Change Patient</p>
              <p className="text-[11px] text-gray-400 font-medium">
                Quickly switch between patients
              </p>
            </div>
          </div>
          <div className="relative flex-1 max-w-[300px] ml-4">
            <select
              value={patientId ?? ""}
              disabled={fetchingPatients}
              onChange={(e) =>
                navigate(`/app/patients/${e.target.value}/reports`)
              }
              className="w-full h-11 pl-4 pr-10 rounded-xl border border-gray-100 bg-gray-50/50 text-[13px] font-semibold text-navy outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all appearance-none cursor-pointer disabled:opacity-50"
            >
              <option value="" disabled>
                Select Patient
              </option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 4l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ══ FILTER BAR ═══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-[12px] font-semibold text-gray-400 whitespace-nowrap">
            From
          </label>
          <input
            type="date"
            value={filter.fromDate}
            onChange={(e) =>
              updateFilter((p) => ({ ...p, fromDate: e.target.value }))
            }
            className={`h-9 px-3 rounded-xl border text-[12.5px] font-medium outline-none transition-all cursor-pointer
              ${filter.fromDate ? "bg-brand-lighter border-brand-primary/20 text-brand-primary" : "bg-gray-50 border-transparent hover:bg-gray-100 text-gray-500"}`}
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[12px] font-semibold text-gray-400 whitespace-nowrap">
            To
          </label>
          <input
            type="date"
            value={filter.toDate}
            onChange={(e) =>
              updateFilter((p) => ({ ...p, toDate: e.target.value }))
            }
            className={`h-9 px-3 rounded-xl border text-[12.5px] font-medium outline-none transition-all cursor-pointer
              ${filter.toDate ? "bg-brand-lighter border-brand-primary/20 text-brand-primary" : "bg-gray-50 border-transparent hover:bg-gray-100 text-gray-500"}`}
          />
        </div>

        {hasFilters && (
          <button
            onClick={() => updateFilter(() => ({ ...EMPTY_REPORT_FILTER }))}
            className="h-9 px-3 rounded-xl text-[12px] font-semibold text-gray-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all whitespace-nowrap"
          >
            ✕ Clear
          </button>
        )}

        <span className="text-[12px] text-gray-400 ml-auto">
          <span className="font-bold text-navy">{reports.length}</span> reports
          found
        </span>
      </div>

      {/* ══ REPORTS ══════════════════════════════════════════════════════ */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 min-h-[320px] flex items-center justify-center">
          <SectionLoader text="Loading reports…" />
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect
                x="5"
                y="4"
                width="22"
                height="24"
                rx="3"
                stroke="#D1D5DB"
                strokeWidth="1.8"
              />
              <path
                d="M10 11h12M10 16h8M10 21h6"
                stroke="#D1D5DB"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="text-center">
            <p className="font-poppins font-bold text-[16px] text-navy">
              No reports found
            </p>
            <p className="text-[12.5px] text-gray-400 mt-1">
              {hasFilters
                ? "Try adjusting the date range"
                : "No reports available for this patient"}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reports.map((report) => (
            <ReportCard key={report._id} report={report} />
          ))}
        </div>
      )}

      {/* ── Create Report Modal ── */}
      <CreateReportModal
        open={modalOpen}
        patientId={patientId ?? ""}
        doctors={doctors}
        loading={actionLoading}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
