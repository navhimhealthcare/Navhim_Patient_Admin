import { useState, useMemo } from "react";
import { useAppointments } from "../hooks/useAppointments";
import {
  Appointment,
  AppointmentFilter,
  AppointmentStatus,
  AppointmentCreateForm,
  AppointmentRescheduleForm,
} from "../types/appointment.types";
import {
  filterAppointments,
  getAppSummary,
  formatDate,
  STATUS_CONFIG,
  PAYMENT_CONFIG,
  MODE_LABEL,
  EMPTY_FILTER,
  isToday,
} from "../helpers/appointmentHelper";
import { SectionLoader } from "../../../components/Loader/Loader";
import BookAppointmentModal from "../components/bookAppointmentModal";
import {
  RescheduleModal,
  CancelAppointmentModal,
} from "../components/appointmentModals";
import { useHospitals } from "../../hospital/component/hooks/useHospitals";
import { useDoctors } from "../../doctors/hooks/useDoctors";
import { usePatients } from "../../patients/hooks/usePatients";

const STATUS_TABS: {
  key: AppointmentStatus | "all";
  label: string;
  icon: string;
}[] = [
  { key: "all", label: "All", icon: "◈" },
  { key: "booked", label: "Booked", icon: "◷" },
  { key: "completed", label: "Completed", icon: "◉" },
  { key: "cancelled", label: "Cancelled", icon: "✕" },
];

const STAT_META = [
  {
    key: "total",
    field: "total" as const,
    label: "Total",
    color: "#4B69FF",
    light: "#EEF1FF",
  },
  {
    key: "booked",
    field: "booked" as const,
    label: "Booked",
    color: "#2563EB",
    light: "#EFF6FF",
  },
  {
    key: "completed",
    field: "completed" as const,
    label: "Completed",
    color: "#16A34A",
    light: "#F0FDF4",
  },
  {
    key: "cancelled",
    field: "cancelled" as const,
    label: "Cancelled",
    color: "#DC2626",
    light: "#FEF2F2",
  },
];

export default function AppointmentsPage() {
  const {
    appointments,
    loading,
    actionLoading,
    bookAppointment,
    rescheduleAppointment,
    cancelAppointment,
    markCompleted,
  } = useAppointments();
  const { hospitals } = useHospitals();
  const { doctors } = useDoctors();
  const { patients } = usePatients();

  const dynamicDoctors = useMemo(
    () => doctors.map((d) => ({ ...d, specialization: d.specialization.name })),
    [doctors],
  );

  const [filter, setFilter] = useState<AppointmentFilter>(EMPTY_FILTER);
  const [bookOpen, setBookOpen] = useState(false);
  const [rescheduleAppt, setRescheduleAppt] = useState<Appointment | null>(
    null,
  );
  const [cancelAppt, setCancelAppt] = useState<Appointment | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(
    () => filterAppointments(appointments, filter),
    [appointments, filter],
  );
  const summary = useMemo(() => getAppSummary(appointments), [appointments]);
  const hasFilters =
    filter.search ||
    filter.mode !== "all" ||
    filter.payment !== "all" ||
    filter.startDate ||
    filter.endDate;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  const updateFilter = (
    updater: (p: AppointmentFilter) => AppointmentFilter,
  ) => {
    setFilter(updater);
    setPage(1);
  };

  const handleBook = (f: AppointmentCreateForm) => bookAppointment(f);
  const handleReschedule = (f: AppointmentRescheduleForm) =>
    rescheduleAppointment(rescheduleAppt!._id, f);
  const handleCancel = async () => {
    if (!cancelAppt) return;
    const ok = await cancelAppointment(cancelAppt);
    if (ok) setCancelAppt(null);
  };

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-3">
            <h1 className="font-poppins font-bold text-[24px] text-navy leading-none">
              Appointments
            </h1>
            {summary.today > 0 && (
              <span className="flex items-center gap-1.5 bg-brand-primary text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                {summary.today} today
              </span>
            )}
          </div>
          <p className="text-[13px] text-gray-400 font-medium mt-1">
            {summary.total} appointments · {summary.unpaid} pending payment
          </p>
        </div>
        <button
          onClick={() => setBookOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-brand-primary to-brand-gradient text-white text-[13px] font-semibold shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 hover:-translate-y-0.5 transition-all duration-200"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 1v12M1 7h12"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          Book Appointment
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-5 gap-3">
        {STAT_META.map((s) => {
          const val =
            s.field === "total"
              ? summary.total
              : (summary[s.field as keyof typeof summary] as number);
          const active = filter.status === (s.key === "total" ? "all" : s.key);
          return (
            <button
              key={s.key}
              onClick={() =>
                updateFilter((p) => ({
                  ...p,
                  status: s.key === "total" ? "all" : (s.key as any),
                }))
              }
              style={
                active
                  ? {
                      background: `linear-gradient(135deg, ${s.color}ee, ${s.color})`,
                      boxShadow: `0 8px 24px ${s.color}30`,
                    }
                  : { background: s.light }
              }
              className={`relative rounded-2xl p-4 text-left overflow-hidden transition-all duration-200 hover:-translate-y-0.5 ${active ? "scale-[1.02]" : "hover:shadow-md"}`}
            >
              <div
                className="absolute -right-3 -top-3 w-16 h-16 rounded-full opacity-20"
                style={{ background: active ? "white" : s.color }}
              />
              <div className="relative">
                <p
                  className={`font-poppins font-black text-[28px] leading-none tracking-tight ${active ? "text-white" : "text-navy"}`}
                >
                  {val}
                </p>
                <p
                  className={`text-[11.5px] font-semibold mt-2 ${active ? "text-white/80" : "text-gray-500"}`}
                >
                  {s.label}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Controls bar ── */}
      <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Status tabs */}
        <div className="flex items-stretch border-b border-gray-100">
          {STATUS_TABS.map((tab) => {
            const cnt =
              tab.key === "all"
                ? appointments.length
                : appointments.filter((a) => a.status === tab.key).length;
            const active = filter.status === tab.key;
            const sc = tab.key !== "all" ? STATUS_CONFIG[tab.key] : null;
            return (
              <button
                key={tab.key}
                onClick={() => updateFilter((p) => ({ ...p, status: tab.key }))}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-[12.5px] font-semibold transition-all relative
                  ${active ? "text-brand-primary bg-brand-lighter" : "text-gray-400 hover:text-navy hover:bg-gray-50"}`}
              >
                <span
                  className={`text-base leading-none ${active ? "opacity-100" : "opacity-50"}`}
                >
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                <span
                  className={`text-[10.5px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center transition-all
                  ${active ? "bg-brand-primary text-white" : sc ? `${sc.bg} ${sc.text}` : "bg-gray-100 text-gray-400"}`}
                >
                  {cnt}
                </span>
                {active && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-primary rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Filter row */}
        <div className="flex items-center gap-2.5 px-4 py-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
            >
              <circle
                cx="6"
                cy="6"
                r="4.5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M9.5 9.5L12.5 12.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <input
              value={filter.search}
              onChange={(e) =>
                updateFilter((p) => ({ ...p, search: e.target.value }))
              }
              placeholder="Search doctor, patient, NFC, reason…"
              className="w-full h-9 pl-9 pr-3 bg-gray-50 rounded-xl text-[12.5px] font-medium text-navy placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-brand-primary/10 focus:bg-white border border-transparent focus:border-brand-primary/20 transition-all"
            />
            {filter.search && (
              <button
                onClick={() => updateFilter((p) => ({ ...p, search: "" }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-500 text-[10px] transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {(
            [
              {
                val: filter.mode,
                key: "mode" as const,
                opts: [
                  ["all", "Mode"],
                  ["Online", "Online"],
                  ["In_Clinic", "In Clinic"],
                  ["Offline", "Offline"],
                ],
              },
              {
                val: filter.payment,
                key: "payment" as const,
                opts: [
                  ["all", "Payment"],
                  ["paid", "Paid"],
                  ["unpaid", "Unpaid"],
                  ["not_required", "Not Required"],
                  ["refunded", "Refunded"],
                ],
              },
            ] as const
          ).map(({ val, key, opts }) => (
            <div key={key} className="relative">
              <select
                value={val}
                onChange={(e) =>
                  updateFilter((p) => ({ ...p, [key]: e.target.value as any }))
                }
                className={`h-9 pl-3 pr-7 rounded-xl text-[12.5px] font-semibold outline-none border transition-all appearance-none cursor-pointer
                  ${val !== "all" ? "bg-brand-lighter border-brand-primary/20 text-brand-primary" : "bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100"}`}
              >
                {opts.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
              >
                <path
                  d="M2 3.5L5 6.5L8 3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          ))}

          <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-2 border border-transparent">
            <span className="text-[10px] font-bold text-gray-300 uppercase">
              From
            </span>
            <input
              type="date"
              value={filter.startDate}
              onChange={(e) =>
                updateFilter((p) => ({ ...p, startDate: e.target.value }))
              }
              className={`h-9 px-1 bg-transparent text-[12px] font-semibold outline-none cursor-pointer transition-all
                ${filter.startDate ? "text-brand-primary" : "text-gray-500"}`}
            />
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-2 border border-transparent">
            <span className="text-[10px] font-bold text-gray-300 uppercase">
              To
            </span>
            <input
              type="date"
              value={filter.endDate}
              onChange={(e) =>
                updateFilter((p) => ({ ...p, endDate: e.target.value }))
              }
              className={`h-9 px-1 bg-transparent text-[12px] font-semibold outline-none cursor-pointer transition-all
                ${filter.endDate ? "text-brand-primary" : "text-gray-500"}`}
            />
          </div>

          {hasFilters && (
            <button
              onClick={() => {
                setFilter(EMPTY_FILTER);
                setPage(1);
              }}
              className="h-9 px-3 rounded-xl text-[12px] font-semibold text-gray-400 hover:text-danger hover:bg-red-50 border border-transparent hover:border-red-100 transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              ✕ Clear all
            </button>
          )}

          <div className="ml-auto pl-3 border-l border-gray-100">
            <p className="text-[12px] text-gray-400 font-medium whitespace-nowrap">
              <span className="font-bold text-navy">{filtered.length}</span>{" "}
              results
            </p>
          </div>
        </div>
      </div>

      {/* ── List ── */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <SectionLoader text="Loading appointments…" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect
                x="6"
                y="4"
                width="24"
                height="28"
                rx="3"
                stroke="#D1D5DB"
                strokeWidth="2"
              />
              <path
                d="M12 12h12M12 18h8M12 24h6"
                stroke="#D1D5DB"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="text-center">
            <p className="font-poppins font-bold text-[16px] text-navy">
              No appointments found
            </p>
            <p className="text-[13px] text-gray-400 mt-1">
              {hasFilters
                ? "Try changing your filters or search term"
                : "Get started by booking the first appointment"}
            </p>
          </div>
          {!hasFilters && (
            <button
              onClick={() => setBookOpen(true)}
              className="mt-1 px-5 py-2.5 rounded-xl bg-brand-lighter text-brand-primary text-[13px] font-semibold hover:bg-brand-soft transition-colors"
            >
              + Book Appointment
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Column header */}
          <div
            className="grid items-center gap-3 px-5 py-2.5 rounded-xl bg-gray-50 border border-gray-100"
            style={{
              gridTemplateColumns: "2fr 1.4fr 1.4fr 110px 110px 110px 120px",
            }}
          >
            {[
              "Doctor & Hospital",
              "Patient",
              "Date & Slot",
              "Mode",
              "Payment",
              "Status",
              "Actions",
            ].map((h) => (
              <p
                key={h}
                className="text-[11px] font-bold text-gray-400 uppercase tracking-wider"
              >
                {h}
              </p>
            ))}
          </div>

          {/* Rows */}
          <div className="flex flex-col gap-2">
            {paginated.map((appt, idx) => {
              const sc = STATUS_CONFIG[appt.status] ?? {
                label: appt.status,
                bg: "bg-gray-100",
                text: "text-gray-500",
                dot: "bg-gray-400",
                border: "border-gray-200",
              };
              const pc = PAYMENT_CONFIG[appt.paymentStatus] ?? {
                label: appt.paymentStatus,
                bg: "bg-gray-100",
                text: "text-gray-500",
              };
              const mc = MODE_LABEL[appt.mode] ?? {
                label: appt.mode,
                icon: "📋",
                bg: "bg-gray-50",
                text: "text-gray-600",
              };
              const today = isToday(appt.appointmentDate);
              const isExp = expandedId === appt._id;
              const canAct =
                appt.status === "booked" || appt.status === "rescheduled";

              // patient is now an object
              const patient = appt.patient;

              return (
                <div
                  key={appt._id}
                  style={{ animationDelay: `${idx * 35}ms` }}
                  className={`bg-white rounded-2xl border overflow-hidden transition-all duration-200 animate-[fadeUp_0.3s_ease_both]
                    ${today ? "border-brand-primary/30 shadow-sm" : "border-gray-100 hover:border-gray-200 hover:shadow-sm"}`}
                >
                  {today && (
                    <div className="h-[3px] bg-gradient-to-r from-brand-primary via-[#809CFF] to-brand-gradient" />
                  )}

                  {/* Main grid row */}
                  <div
                    className="grid items-center gap-3 px-5 py-4"
                    style={{
                      gridTemplateColumns:
                        "2fr 1.4fr 1.4fr 110px 110px 110px 120px",
                    }}
                  >
                    {/* Col 1 — Doctor */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-brand-lighter border border-brand-primary/10 flex items-center justify-center">
                          {appt.doctor?.profileImage ? (
                            <img
                              src={appt.doctor.profileImage}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg">👨‍⚕️</span>
                          )}
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${sc.dot}`}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-navy truncate">
                          {appt.doctor?.name ?? "—"}
                        </p>
                        <p className="text-[11.5px] text-gray-400 truncate mt-0.5">
                          {appt.doctor?.specialization?.name ?? "—"}
                        </p>
                        <p className="text-[11px] text-gray-300 truncate">
                          🏥 {appt.hospital?.name ?? "—"}
                        </p>
                      </div>
                    </div>

                    {/* Col 2 — Patient */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-bold text-navy truncate">
                          {patient?.name ?? "—"}
                        </p>
                        {patient?.nfcCardNumber && (
                          <p className="text-[10.5px] text-gray-400 font-mono truncate mt-0.5">
                            📡 {patient.nfcCardNumber}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Col 3 — Date & Slot */}
                    <div className="flex flex-col gap-0.5">
                      <div
                        className={`flex items-center gap-1.5 text-[12px] font-bold ${today ? "text-brand-primary" : "text-navy"}`}
                      >
                        {today && (
                          <span className="text-[9px] font-extrabold bg-brand-primary text-white px-1.5 py-0.5 rounded-md tracking-widest">
                            TODAY
                          </span>
                        )}
                        {formatDate(appt.appointmentDate)}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
                        <span className="text-[11.5px] text-gray-500 font-medium">
                          {appt.slot}
                        </span>
                      </div>
                    </div>

                    {/* Col 4 — Mode */}
                    <div>
                      <span
                        className={`inline-flex items-center gap-1 text-[11.5px] font-semibold px-2.5 py-1 rounded-lg ${mc.bg} ${mc.text}`}
                      >
                        <span className="text-xs">{mc.icon}</span>
                        {mc.label}
                      </span>
                    </div>

                    {/* Col 5 — Payment */}
                    <div>
                      <span
                        className={`inline-flex text-[11.5px] font-semibold px-2.5 py-1 rounded-lg ${pc.bg} ${pc.text}`}
                      >
                        {pc.label}
                      </span>
                    </div>

                    {/* Col 6 — Status */}
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-3 py-1 rounded-full border ${sc.bg} ${sc.text} ${sc.border}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sc.dot}`}
                        />
                        {sc.label}
                      </span>
                    </div>

                    {/* Col 7 — Actions */}
                    <div className="flex items-center gap-1 justify-end">
                      {canAct && (
                        <>
                          <button
                            onClick={() => setRescheduleAppt(appt)}
                            title="Reschedule"
                            className="w-8 h-8 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-600 flex items-center justify-center transition-all text-sm"
                          >
                            🔄
                          </button>
                          <button
                            onClick={() => setCancelAppt(appt)}
                            title="Cancel"
                            className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-danger flex items-center justify-center transition-all text-sm"
                          >
                            ✕
                          </button>
                        </>
                      )}
                      {appt.status === "booked" && (
                        <button
                          onClick={() => markCompleted(appt._id)}
                          title="Mark done"
                          className="w-8 h-8 rounded-lg bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 flex items-center justify-center transition-all text-sm"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        onClick={() => setExpandedId(isExp ? null : appt._id)}
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all
                          ${isExp ? "bg-brand-lighter border-brand-primary/20 text-brand-primary" : "bg-gray-50 border-gray-200 text-gray-400 hover:bg-brand-lighter hover:border-brand-primary/20 hover:text-brand-primary"}`}
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                          className={`transition-transform duration-200 ${isExp ? "rotate-180" : ""}`}
                        >
                          <path
                            d="M2 3.5L5 6.5L8 3.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* ── Expanded drawer ── */}
                  {isExp && (
                    <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-4 animate-[fadeUp_0.15s_ease_both]">
                      <div className="grid grid-cols-3 gap-4">
                        {/* Patient card */}
                        <div>
                          <p className="text-[10.5px] font-black text-gray-400 uppercase tracking-widest mb-2">
                            Patient
                          </p>
                          <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-brand-lighter border border-brand-primary/10 flex items-center justify-center text-lg flex-shrink-0">
                                👤
                              </div>
                              <div className="min-w-0">
                                <p className="text-[13px] font-bold text-navy truncate">
                                  {patient?.name ?? "—"}
                                </p>
                                <p className="text-[11px] text-gray-400 font-mono truncate">
                                  ID:{" "}
                                  {patient?._id?.slice(-8).toUpperCase() ?? "—"}
                                </p>
                              </div>
                            </div>
                            {patient?.nfcCardNumber && (
                              <div className="flex items-center gap-2 bg-surface rounded-lg px-3 py-2">
                                <span className="text-sm">📡</span>
                                <div>
                                  <p className="text-[10px] text-gray-400 font-medium">
                                    NFC Card
                                  </p>
                                  <p className="text-[12px] font-bold text-navy font-mono">
                                    {patient.nfcCardNumber}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Reason card */}
                        <div>
                          <p className="text-[10.5px] font-black text-gray-400 uppercase tracking-widest mb-2">
                            Reason for Visit
                          </p>
                          <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 h-[calc(100%-24px)]">
                            <p className="text-[13px] text-navy font-medium leading-relaxed">
                              {appt.reason || (
                                <span className="text-gray-300 italic">
                                  No reason provided
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Booking meta */}
                        <div>
                          <p className="text-[10.5px] font-black text-gray-400 uppercase tracking-widest mb-2">
                            Booking Details
                          </p>
                          <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex flex-col gap-2.5">
                            {[
                              {
                                k: "Booking ID",
                                v: `#${appt._id.slice(-8).toUpperCase()}`,
                              },
                              { k: "Booked On", v: formatDate(appt.createdAt) },
                              {
                                k: "Hospital",
                                v: appt.hospital?.address ?? "—",
                              },
                              {
                                k: "Rating",
                                v: `⭐ ${appt.doctor?.rating ?? 0} (${appt.doctor?.reviewsCount ?? 0} reviews)`,
                              },
                            ].map(({ k, v }) => (
                              <div
                                key={k}
                                className="flex items-start justify-between gap-2"
                              >
                                <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
                                  {k}
                                </span>
                                <span className="text-[11.5px] font-bold text-navy text-right">
                                  {v}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Pagination ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="text-[12.5px] text-gray-400">
                Showing{" "}
                <span className="font-bold text-navy">
                  {(page - 1) * pageSize + 1}
                </span>
                –
                <span className="font-bold text-navy">
                  {Math.min(page * pageSize, filtered.length)}
                </span>{" "}
                of{" "}
                <span className="font-bold text-navy">{filtered.length}</span>
              </p>
              <div className="h-4 w-px bg-gray-200" />
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-gray-400">Rows</span>
                <div className="relative">
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="h-7 pl-2 pr-6 bg-gray-50 rounded-lg text-[12px] font-bold text-navy outline-none border border-gray-200 appearance-none cursor-pointer"
                  >
                    {[10, 25, 50, 100].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                    width="8"
                    height="8"
                    viewBox="0 0 10 10"
                    fill="none"
                  >
                    <path
                      d="M2 3.5L5 6.5L8 3.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {[
                { label: "«", action: () => setPage(1), disabled: page === 1 },
                {
                  label: "‹",
                  action: () => setPage((p) => p - 1),
                  disabled: page === 1,
                },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={btn.action}
                  disabled={btn.disabled}
                  className="w-8 h-8 rounded-lg text-[13px] font-bold text-gray-400 hover:bg-brand-lighter hover:text-brand-primary disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                >
                  {btn.label}
                </button>
              ))}

              {(() => {
                const delta = 2;
                const start = Math.max(
                  1,
                  Math.min(page - delta, totalPages - delta * 2),
                );
                const end = Math.min(
                  totalPages,
                  Math.max(page + delta, delta * 2 + 1),
                );
                return Array.from(
                  { length: end - start + 1 },
                  (_, i) => start + i,
                ).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-[12.5px] font-bold transition-all
                      ${p === page ? "bg-brand-primary text-white shadow-sm shadow-brand-primary/30" : "text-gray-500 hover:bg-brand-lighter hover:text-brand-primary"}`}
                  >
                    {p}
                  </button>
                ));
              })()}

              {[
                {
                  label: "›",
                  action: () => setPage((p) => p + 1),
                  disabled: page === totalPages,
                },
                {
                  label: "»",
                  action: () => setPage(totalPages),
                  disabled: page === totalPages,
                },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={btn.action}
                  disabled={btn.disabled}
                  className="w-8 h-8 rounded-lg text-[13px] font-bold text-gray-400 hover:bg-brand-lighter hover:text-brand-primary disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Modals ── */}
      <BookAppointmentModal
        open={bookOpen}
        onClose={() => setBookOpen(false)}
        onSubmit={handleBook}
        loading={actionLoading}
        patients={patients}
        doctors={dynamicDoctors}
        hospitals={hospitals}
      />
      <RescheduleModal
        open={!!rescheduleAppt}
        onClose={() => setRescheduleAppt(null)}
        onSubmit={handleReschedule}
        appointment={rescheduleAppt}
        loading={actionLoading}
      />
      <CancelAppointmentModal
        open={!!cancelAppt}
        onClose={() => setCancelAppt(null)}
        onConfirm={handleCancel}
        appointment={cancelAppt}
        loading={actionLoading}
      />
    </div>
  );
}
