import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePrescriptions, EMPTY_FILTER } from '../hooks/usePrescriptions'
import { Prescription, PrescriptionStatus } from '../types/prescription.types'
import { SectionLoader } from '../../../components/Loader/Loader'
import { fmtDate } from '../utils/prescriptionUtils'
import { patientService } from '../../patients/services/patientService'

// ── Types ─────────────────────────────────────────────────────────────────
interface PatientOption {
  _id: string
  name: string
}

// ── Status config ─────────────────────────────────────────────────────────
const STATUS_CFG: Record<PrescriptionStatus, {
  badge: string; dot: string; avatar: string; label: string
  statBg: string; statBorder: string; statNum: string
}> = {
  ongoing: {
    badge:      'bg-sky-50 text-sky-700 border border-sky-100',
    dot:        'bg-sky-400',
    avatar:     'bg-sky-50 text-sky-600',
    label:      'Ongoing',
    statBg:     'bg-sky-50',
    statBorder: 'border-sky-200',
    statNum:    'text-sky-600',
  },
  completed: {
    badge:      'bg-emerald-50 text-emerald-700 border border-emerald-100',
    dot:        'bg-emerald-400',
    avatar:     'bg-emerald-50 text-emerald-600',
    label:      'Completed',
    statBg:     'bg-emerald-50',
    statBorder: 'border-emerald-200',
    statNum:    'text-emerald-600',
  },
  cancelled: {
    badge:      'bg-rose-50 text-rose-600 border border-rose-100',
    dot:        'bg-rose-400',
    avatar:     'bg-rose-50 text-rose-500',
    label:      'Cancelled',
    statBg:     'bg-rose-50',
    statBorder: 'border-rose-200',
    statNum:    'text-rose-500',
  },
}

// ── Timing label map ──────────────────────────────────────────────────────
const TIMING_LABELS: Record<string, { short: string; icon: string }> = {
  morning:   { short: 'Morn', icon: '🌅' },
  afternoon: { short: 'Aft',  icon: '☀️'  },
  evening:   { short: 'Eve',  icon: '🌆' },
  night:     { short: 'Night',icon: '🌙' },
  bedtime:   { short: 'Bed',  icon: '🌙' },
  breakfast: { short: 'Break',icon: '🌅' },
  lunch:     { short: 'Lunch',icon: '☀️'  },
  dinner:    { short: 'Din',  icon: '🌆' },
}

// ── Status Badge ──────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: PrescriptionStatus }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.ongoing
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[11px] font-semibold ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

// ── Patient Dropdown ──────────────────────────────────────────────────────
function PatientDropdown({
  patients, selectedId, onChange, loading,
}: {
  patients: PatientOption[]
  selectedId: string
  onChange: (id: string) => void
  loading: boolean
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const selected = patients.find(p => p._id === selectedId)
  const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-2 h-8 pl-3 pr-2.5 rounded-xl border text-[12px] font-medium transition-all min-w-[148px]
          ${selectedId
            ? 'bg-brand-lighter border-brand-primary/20 text-brand-primary'
            : 'bg-gray-50 border-transparent hover:bg-gray-100 text-gray-500'
          }`}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="4" r="2.3" stroke="currentColor" strokeWidth="1.3" />
          <path d="M1 10.5c0-2 2.24-3.5 5-3.5s5 1.5 5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <span className="truncate">{selected ? selected.name : 'All Patients'}</span>
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          className={`ml-auto flex-shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-60 bg-white rounded-xl border border-gray-100 shadow-xl z-50 overflow-hidden">
          <div className="p-2 border-b border-gray-50">
            <input
              autoFocus
              type="text"
              placeholder="Search patients…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-7 px-2.5 rounded-lg bg-gray-50 border border-transparent text-[12px] text-gray-700 placeholder:text-gray-300 outline-none focus:border-brand-primary/30 focus:bg-white transition-all"
            />
          </div>
          <div className="max-h-52 overflow-y-auto py-1">
            {loading ? (
              <div className="px-3 py-3 text-center text-[12px] text-gray-400">Loading…</div>
            ) : (
              <>
                {/* <button
                  onClick={() => { onChange(''); setOpen(false); setSearch('') }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium text-left transition-colors
                    ${!selectedId ? 'bg-brand-lighter text-brand-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  All Patients
                </button> */}
                {filtered.map(p => (
                  <button
                    key={p._id}
                    onClick={() => { onChange(p._id); setOpen(false); setSearch('') }}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium text-left transition-colors
                      ${selectedId === p._id ? 'bg-brand-lighter text-brand-primary' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 bg-brand-lighter text-brand-primary">
                      {p.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="truncate">{p.name}</span>
                  </button>
                ))}
                {filtered.length === 0 && search && (
                  <div className="px-3 py-3 text-center text-[12px] text-gray-400">No patients found</div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Medicine timing chips ─────────────────────────────────────────────────
function TimingChips({ times, status }: { times: string[]; status: PrescriptionStatus }) {
  if (!times || times.length === 0) return <span className="text-[11px] text-gray-300">—</span>
  return (
    <div className="flex flex-wrap gap-1">
      {times.map(t => {
        const meta = TIMING_LABELS[t.toLowerCase()] ?? { short: t, icon: '' }
        return (
          <span
            key={t}
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold capitalize
              ${status === 'ongoing'   ? 'bg-sky-50 text-sky-600'
              : status === 'completed' ? 'bg-emerald-50 text-emerald-600'
              : 'bg-rose-50 text-rose-500'}`}
          >
            {meta.short}
          </span>
        )
      })}
    </div>
  )
}

// ── Table Row ─────────────────────────────────────────────────────────────
function PrescriptionRow({ rx, idx }: { rx: Prescription; idx: number }) {
  const cfg = STATUS_CFG[rx.status] ?? STATUS_CFG.ongoing
  const initials = rx.doctorId?.name
    ? rx.doctorId.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'DR'

  // Flatten unique timings across all medicines
  const allTimings = Array.from(
    new Set((rx.medicines ?? []).flatMap(m => m.times ?? []))
  )

  return (
    <tr
      className={`group border-b border-gray-50 last:border-b-0 hover:bg-brand-lighter/40 transition-colors duration-100
        ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
    >
      {/* Doctor */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-semibold overflow-hidden ${cfg.avatar}`}
          >
            {rx.doctorId?.profileImage
              ? <img src={rx.doctorId.profileImage} alt={rx.doctorId.name} className="w-full h-full object-cover" />
              : initials
            }
          </div>
          <span className="text-[13px] font-medium text-navy whitespace-nowrap">
            {rx.doctorId?.name ?? '—'}
          </span>
        </div>
      </td>

      {/* Diagnosis */}
      <td className="px-4 py-3.5">
        <span className="text-[13px] text-gray-800 font-medium">{rx.diagnosis}</span>
      </td>

      {/* Medicines + timings */}
      <td className="px-4 py-3.5">
        <div className="flex flex-col gap-1.5">
          {/* Medicine name pills */}
          <div className="flex flex-wrap items-center gap-1">
            {(rx.medicines ?? []).slice(0, 2).map(m => (
              <span
                key={m._id ?? m.name}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap bg-brand-lighter text-brand-primary border border-brand-primary/10"
              >
                {m.name}
                {m.dosage && <span className="opacity-60 text-[10px]">{m.dosage}</span>}
              </span>
            ))}
            {(rx.medicines?.length ?? 0) > 2 && (
              <span className="text-[11px] text-gray-400 font-medium">
                +{rx.medicines.length - 2}
              </span>
            )}
            {(rx.medicines?.length ?? 0) === 0 && (
              <span className="text-[12px] text-gray-300">—</span>
            )}
          </div>

          {/* Timing chips */}
          <TimingChips times={allTimings} status={rx.status} />
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3.5">
        <StatusBadge status={rx.status} />
      </td>

      {/* Date */}
      <td className="px-4 py-3.5">
        <span className="text-[12px] text-gray-400 whitespace-nowrap">{fmtDate(rx.createdAt)}</span>
      </td>

      {/* PDF */}
      <td className="px-5 py-3.5">
        {rx.pdfUrl ? (
          <a
            href={rx.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11.5px] font-semibold bg-brand-lighter text-brand-primary hover:bg-brand-soft transition-colors"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M5.5 1v6M3.5 5l2 2 2-2M1 9.5h9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            View
          </a>
        ) : (
          <span className="text-[12px] text-gray-300">—</span>
        )}
      </td>
    </tr>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function PrescriptionListPage() {
  const { patientId: routePatientId } = useParams<{ patientId: string }>()
  const navigate = useNavigate()

  const [patients, setPatients] = useState<PatientOption[]>([])
  const [patientsLoading, setPatientsLoading] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(routePatientId ?? null)

  const fetchPatientId = selectedPatientId === null ? '' : selectedPatientId

  const {
    prescriptions, allPrescriptions, loading,
    filter, updateFilter, refresh,
  } = usePrescriptions(fetchPatientId)

  const hasFilters = filter.fromDate || filter.toDate || filter.status !== 'all' || selectedPatientId

  const summary = {
    total:     allPrescriptions.length,
    ongoing:   allPrescriptions.filter(p => p.status === 'ongoing').length,
    completed: allPrescriptions.filter(p => p.status === 'completed').length,
    cancelled: allPrescriptions.filter(p => p.status === 'cancelled').length,
  }

  useEffect(() => {
    setPatientsLoading(true)
    patientService.getAll({})
      .then(res => setPatients((res.data?.data ?? []).map((p: any) => ({ _id: p._id, name: p.name }))))
      .catch(() => {})
      .finally(() => setPatientsLoading(false))
  }, [])

  const handleClearFilters = () => {
    updateFilter(() => ({ ...EMPTY_FILTER }))
    setSelectedPatientId(routePatientId ?? null)
  }

  // ── Stat cards ──────────────────────────────────────────────────────────
  const stats = [
    {
      key: 'all',
      label: 'Total',
      val: summary.total,
      activeBg: 'bg-brand-lighter',
      activeBorder: 'border-brand-primary/30',
      activeNum: 'text-brand-primary',
      inactiveBg: 'bg-white',
    },
    {
      key: 'ongoing',
      label: 'Ongoing',
      val: summary.ongoing,
      activeBg: STATUS_CFG.ongoing.statBg,
      activeBorder: STATUS_CFG.ongoing.statBorder,
      activeNum: STATUS_CFG.ongoing.statNum,
      inactiveBg: 'bg-white',
    },
    {
      key: 'completed',
      label: 'Completed',
      val: summary.completed,
      activeBg: STATUS_CFG.completed.statBg,
      activeBorder: STATUS_CFG.completed.statBorder,
      activeNum: STATUS_CFG.completed.statNum,
      inactiveBg: 'bg-white',
    },
    {
      key: 'cancelled',
      label: 'Cancelled',
      val: summary.cancelled,
      activeBg: STATUS_CFG.cancelled.statBg,
      activeBorder: STATUS_CFG.cancelled.statBorder,
      activeNum: STATUS_CFG.cancelled.statNum,
      inactiveBg: 'bg-white',
    },
  ] as const

  const isActive = (key: string) => filter.status === key

  return (
    <div className="flex flex-col gap-5 pb-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-navy hover:border-gray-300 transition-all"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M8.5 2L3.5 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div>
            <h1 className="font-poppins font-black text-[24px] text-navy tracking-tight leading-none">
              Prescriptions
            </h1>
            <p className="text-[12px] text-gray-400 mt-0.5 font-medium">Medication history &amp; records</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 h-8 px-3.5 rounded-xl border border-gray-200 bg-white text-[12px] font-medium text-gray-500 hover:text-navy hover:border-gray-300 transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={loading ? 'animate-spin' : ''}>
              <path d="M10 6A4 4 0 112 6M10 6V4M10 6H8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Refresh
          </button>

          {/* Brand gradient Add Prescription button */}
          <button
            onClick={() => {
              const createId = selectedPatientId || routePatientId || 'unknown'
              navigate(`/app/patients/${createId}/prescriptions/create`)
            }}
            className="flex items-center gap-1.5 h-8 px-4 rounded-xl text-white text-[12.5px] font-bold
              bg-gradient-to-br from-brand-primary to-brand-gradient
              shadow-md shadow-brand-primary/30 hover:shadow-brand-primary/50
              hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M5.5 1v9M1 5.5h9" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Add Prescription
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map(s => {
          const active = isActive(s.key)
          return (
            <button
              key={s.key}
              onClick={() => updateFilter(p => ({ ...p, status: s.key }))}
              className={`flex items-center justify-between px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-150 hover:-translate-y-0.5
                ${active
                  ? `${s.activeBg} ${s.activeBorder} shadow-sm -translate-y-0.5`
                  : 'bg-white border-transparent hover:border-gray-100 hover:shadow-sm'
                }`}
            >
              <div>
                <p className={`font-poppins font-black text-[26px] leading-none ${active ? s.activeNum : 'text-navy'}`}>
                  {s.val}
                </p>
                <p className={`text-[12px] font-medium mt-1 ${active ? s.activeNum : 'text-gray-400'}`}>
                  {s.label}
                </p>
              </div>
              {active && (
                <div className={`w-2 h-2 rounded-full ${s.activeNum.replace('text-', 'bg-')}`} />
              )}
            </button>
          )
        })}
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-white rounded-2xl border border-gray-100 px-4 py-2.5 flex items-center gap-3 flex-wrap shadow-sm">

        {/* Status tabs — active uses brand color */}
        <div className="flex bg-gray-100 rounded-xl p-0.5 gap-0.5">
          {(['all', 'ongoing', 'completed', 'cancelled'] as const).map(s => (
            <button
              key={s}
              onClick={() => updateFilter(p => ({ ...p, status: s }))}
              className={`px-3 h-7 rounded-lg text-[11.5px] font-semibold capitalize transition-all
                ${filter.status === s
                  ? 'bg-white shadow-sm text-brand-primary'
                  : 'text-gray-500 hover:text-navy'
                }`}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-gray-200" />

        {/* Patient dropdown */}
        <PatientDropdown
          patients={patients}
          selectedId={selectedPatientId ?? ''}
          onChange={(id) => setSelectedPatientId(id || null)}
          loading={patientsLoading}
        />

        <div className="w-px h-4 bg-gray-200" />

        {/* Date range */}
        <div className="flex items-center gap-1.5">
          <label className="text-[11.5px] font-medium text-gray-400">From</label>
          <input
            type="date"
            value={filter.fromDate}
            onChange={e => updateFilter(p => ({ ...p, fromDate: e.target.value }))}
            className={`h-8 px-2.5 rounded-xl border text-[11.5px] font-medium outline-none transition-all cursor-pointer
              ${filter.fromDate
                ? 'bg-brand-lighter border-brand-primary/20 text-brand-primary'
                : 'bg-gray-50 border-transparent hover:bg-gray-100 text-gray-500'
              }`}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-[11.5px] font-medium text-gray-400">To</label>
          <input
            type="date"
            value={filter.toDate}
            onChange={e => updateFilter(p => ({ ...p, toDate: e.target.value }))}
            className={`h-8 px-2.5 rounded-xl border text-[11.5px] font-medium outline-none transition-all cursor-pointer
              ${filter.toDate
                ? 'bg-brand-lighter border-brand-primary/20 text-brand-primary'
                : 'bg-gray-50 border-transparent hover:bg-gray-100 text-gray-500'
              }`}
          />
        </div>

        {hasFilters && (
          <button
            onClick={handleClearFilters}
            className="h-7 px-2.5 rounded-xl text-[11.5px] font-medium text-gray-400 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all flex items-center gap-1"
          >
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
              <path d="M1 1l7 7M8 1L1 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Clear
          </button>
        )}

        <span className="text-[11.5px] text-gray-400 ml-auto">
          <span className="font-semibold text-navy">{prescriptions.length}</span> results
        </span>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 min-h-[280px] flex items-center justify-center">
          <SectionLoader text="Loading prescriptions…" />
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-lighter flex items-center justify-center">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <rect x="3" y="2" width="20" height="22" rx="3" stroke="currentColor" strokeWidth="1.6" className="text-brand-primary" />
              <path d="M8 8h10M8 12h10M8 16h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="text-brand-primary" />
            </svg>
          </div>
          <div className="text-center">
            <p className="font-semibold text-[15px] text-navy">No prescriptions found</p>
            <p className="text-[12px] text-gray-400 mt-1">
              {hasFilters ? 'Try adjusting or clearing your filters' : 'No prescriptions for this patient yet'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasFilters && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-[12px] font-medium hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            )}
            {!hasFilters && (
              <button
                onClick={() => {
                  const createId = selectedPatientId || routePatientId || 'unknown'
                  navigate(`/app/patients/${createId}/prescriptions/create`)
                }}
                className="px-5 py-2 rounded-xl text-white text-[12.5px] font-bold
                  bg-gradient-to-br from-brand-primary to-brand-gradient
                  shadow-md shadow-brand-primary/30 hover:-translate-y-0.5 transition-all duration-200"
              >
                + Add Prescription
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100" style={{ background: 'linear-gradient(to right, #f5f7ff, #f8f9ff)' }}>
                <th className="text-left px-5 py-3 text-[10.5px] font-semibold text-brand-primary/60 uppercase tracking-wider">Doctor</th>
                <th className="text-left px-4 py-3 text-[10.5px] font-semibold text-brand-primary/60 uppercase tracking-wider">Diagnosis</th>
                <th className="text-left px-4 py-3 text-[10.5px] font-semibold text-brand-primary/60 uppercase tracking-wider">Medicines &amp; Timing</th>
                <th className="text-left px-4 py-3 text-[10.5px] font-semibold text-brand-primary/60 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-[10.5px] font-semibold text-brand-primary/60 uppercase tracking-wider">Date</th>
                <th className="text-left px-5 py-3 text-[10.5px] font-semibold text-brand-primary/60 uppercase tracking-wider">PDF</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((rx, idx) => (
                <PrescriptionRow key={rx._id} rx={rx} idx={idx} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
