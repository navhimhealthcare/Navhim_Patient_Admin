import { useMemo, useState, useRef, useEffect } from 'react'
import { useActivityLog, EMPTY_FILTER, LIMIT_OPTIONS, DEFAULT_LIMIT } from '../hooks/useActivityLog'
import { ActivityLog, LogMethod } from '../types/activityLog.types'
import { SectionLoader }          from '../../../components/Loader/Loader'

// ── Helpers ───────────────────────────────────────────────────────────────
const formatDateTime = (iso: string) => {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
  }
}
const cleanIp = (ip: string) => ip.replace('::ffff:', '')
const parseUA  = (ua: string) => {
  if (!ua) return '—'
  if (/chrome/i.test(ua) && !/edge/i.test(ua)) return 'Chrome'
  if (/firefox/i.test(ua))  return 'Firefox'
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari'
  if (/edge/i.test(ua))     return 'Edge'
  if (/postman/i.test(ua))  return 'Postman'
  return 'Other'
}

// ── Method badge ──────────────────────────────────────────────────────────
const METHOD_CFG: Record<LogMethod, { bg: string; text: string }> = {
  GET:    { bg: 'bg-blue-50',   text: 'text-blue-600'   },
  POST:   { bg: 'bg-green-50',  text: 'text-green-600'  },
  PUT:    { bg: 'bg-amber-50',  text: 'text-amber-600'  },
  PATCH:  { bg: 'bg-violet-50', text: 'text-violet-600' },
  DELETE: { bg: 'bg-red-50',    text: 'text-red-600'    },
}
function MethodBadge({ method }: { method: LogMethod }) {
  const cfg = METHOD_CFG[method] ?? { bg: 'bg-gray-100', text: 'text-gray-500' }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wide ${cfg.bg} ${cfg.text}`}>
      {method}
    </span>
  )
}

// ── Status badge ──────────────────────────────────────────────────────────
function StatusBadge({ code }: { code: number }) {
  const cfg =
    code < 300 ? { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500' } :
    code < 400 ? { bg: 'bg-blue-50',  text: 'text-blue-600',  dot: 'bg-blue-500'  } :
    code < 500 ? { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' } :
                 { bg: 'bg-red-50',   text: 'text-red-600',   dot: 'bg-red-500'   }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {code}
    </span>
  )
}

// ── Role badge ────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === 'admin'
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider whitespace-nowrap
      ${isAdmin ? 'bg-brand-lighter text-brand-primary' : 'bg-green-50 text-green-600'}`}>
      <span className="flex-shrink-0">{isAdmin ? '🛡' : '👤'}</span>
      <span>{role}</span>
    </span>
  )
}

// ── Limit picker ──────────────────────────────────────────────────────────
function LimitPicker({ limit, onLimit }: { limit: number; onLimit: (l: number) => void }) {
  const [dropOpen,    setDropOpen]    = useState(false)
  const [inputMode,   setInputMode]   = useState(false)
  const [manualInput, setManualInput] = useState('')
  const dropRef  = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false); setInputMode(false); setManualInput('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { if (inputMode) inputRef.current?.focus() }, [inputMode])

  const handleManualSubmit = () => {
    const val = parseInt(manualInput, 10)
    if (!isNaN(val) && val >= 1 && val <= 5000) {
      onLimit(val); setDropOpen(false)
    }
    setInputMode(false); setManualInput('')
  }

  const isCustom = !LIMIT_OPTIONS.includes(limit)

  return (
    <div className="relative" ref={dropRef}>
      <button
        onClick={() => { setDropOpen(o => !o); setInputMode(false); setManualInput('') }}
        className={`h-9 flex items-center gap-2 px-3.5 rounded-xl border text-[12.5px] font-bold transition-all
          ${dropOpen
            ? 'border-brand-primary bg-brand-lighter text-brand-primary'
            : isCustom
              ? 'border-violet-200 bg-violet-50 text-violet-700'
              : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-white'
          }`}
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M1.5 3h10M3.5 6.5h6M5.5 10h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        Limit: <span className="text-navy font-black">{limit}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
          className={`transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {dropOpen && (
        <div className="absolute top-full left-0 mt-1.5 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 w-52 overflow-hidden animate-[fadeUp_0.15s_ease_both]">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 px-4 pt-3.5 pb-2">
            Fetch limit
          </p>

          {/* Preset options */}
          {LIMIT_OPTIONS.map(opt => (
            <button key={opt}
              onClick={() => { onLimit(opt); setDropOpen(false); setInputMode(false) }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] font-semibold transition-colors
                ${limit === opt ? 'bg-brand-lighter text-brand-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-navy'}`}>
              <span>{opt} logs</span>
              {limit === opt && (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2 6.5l3.5 3.5 5.5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          ))}

          {/* Custom input */}
          <div className="border-t border-gray-100 mx-3 mt-1 mb-3 pt-2.5">
            {inputMode ? (
              <div className="flex items-center gap-1.5">
                <input
                  ref={inputRef}
                  type="number" min={1} max={5000}
                  value={manualInput}
                  onChange={e => setManualInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleManualSubmit()
                    if (e.key === 'Escape') { setInputMode(false); setManualInput('') }
                  }}
                  placeholder="e.g. 150"
                  className="flex-1 h-8 px-2.5 rounded-lg border border-brand-primary/30 bg-brand-lighter text-[12.5px] font-bold text-navy outline-none focus:ring-2 focus:ring-brand-primary/15 placeholder:text-gray-300 w-0"
                />
                <button onClick={handleManualSubmit}
                  className="h-8 px-2.5 rounded-lg bg-brand-primary text-white text-[11.5px] font-black hover:bg-brand-gradient transition-colors">
                  OK
                </button>
                <button onClick={() => { setInputMode(false); setManualInput('') }}
                  className="h-8 w-8 rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 text-[11px] flex items-center justify-center transition-colors flex-shrink-0">
                  ✕
                </button>
              </div>
            ) : (
              <button onClick={() => setInputMode(true)}
                className="w-full flex items-center gap-2 text-[12.5px] font-semibold text-gray-400 hover:text-brand-primary transition-colors py-1">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Enter custom limit…
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Row detail drawer ─────────────────────────────────────────────────────
function LogDrawer({ log, onClose }: { log: ActivityLog; onClose: () => void }) {
  const { date, time } = formatDateTime(log.createdAt)
  return (
    <tr>
      <td colSpan={8} className="bg-surface px-6 py-4 border-b border-gray-100">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-2">User Agent</p>
            <p className="text-[11.5px] text-navy font-medium leading-relaxed break-words">{log.userAgent || '—'}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-2">Timestamp</p>
            <p className="text-[13px] font-bold text-navy">{date}</p>
            <p className="text-[12px] text-gray-400 mt-0.5">{time}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-1 mt-3">IP Address</p>
            <p className="font-mono text-[12.5px] font-bold text-navy">{cleanIp(log.ipAddress)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-2">Full Endpoint</p>
            <p className="font-mono text-[12px] text-navy font-medium break-all leading-relaxed">{log.endpoint}</p>
          </div>
        </div>
        <div className="flex justify-end mt-3">
          <button onClick={onClose} className="text-[12px] text-gray-400 hover:text-navy font-semibold transition-colors">
            ✕ Close
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function ActivityLogPage() {
  const {
    logs, total, fetchedCount, loading,
    limit, setLimit,
    filter, updateFilter, refresh,
  } = useActivityLog()

  const [expandedId,  setExpandedId]  = useState<string | null>(null)
  const [searchDraft, setSearchDraft] = useState('')
  const searchTimer = useMemo(() => ({ id: 0 as any }), [])

  const handleSearchChange = (val: string) => {
    setSearchDraft(val)
    clearTimeout(searchTimer.id)
    searchTimer.id = setTimeout(() => updateFilter(p => ({ ...p, search: val })), 350)
  }

  const hasFilters = filter.role !== 'all' || filter.startDate || filter.endDate || filter.search

  const COLS = [
    { label: 'User',        w: 'w-[180px]' },
    { label: 'Role',        w: 'w-[90px]'  },
    { label: 'Method',      w: 'w-[80px]'  },
    { label: 'Endpoint',    w: 'flex-1'    },
    { label: 'Status',      w: 'w-[80px]'  },
    { label: 'IP Address',  w: 'w-[130px]' },
    { label: 'Browser',     w: 'w-[90px]'  },
    { label: 'Date & Time', w: 'w-[140px]' },
  ]

  return (
    <div className="flex flex-col gap-6 pb-6">

      {/* ══ HEADER ═══════════════════════════════════════════════════════ */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-poppins font-black text-[28px] text-navy tracking-tight leading-none">
            Activity Logs
          </h1>
          <p className="text-[13.5px] text-gray-400 font-medium mt-1">
            Track all API activity across admin and patient accounts
          </p>
        </div>
        <button onClick={refresh}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-[13px] font-semibold text-gray-500 hover:text-navy hover:border-gray-300 hover:shadow-sm transition-all">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={loading ? 'animate-spin' : ''}>
            <path d="M12 7A5 5 0 112 7M12 7V4M12 7h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* ══ STAT CARDS ═══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: 'Fetched Logs', val: fetchedCount, sub: `Limit: ${limit}`,
            icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="2" width="16" height="18" rx="2" stroke="#4B69FF" strokeWidth="1.5"/><path d="M7 7h8M7 11h8M7 15h5" stroke="#4B69FF" strokeWidth="1.5" strokeLinecap="round"/></svg>,
            bg: 'bg-[#EEF1FF]', valColor: 'text-[#4B69FF]', active: false,
            onClick: () => updateFilter(p => ({ ...p, role: 'all' })),
          },
          {
            label: 'Admin Logs', val: fetchedCount, sub: 'Click to filter',
            icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 3l2.5 5 5.5.8-4 3.9.9 5.3L11 15.5 6.1 18l.9-5.3-4-3.9 5.5-.8L11 3z" stroke="#4B69FF" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
            bg: 'bg-[#EEF1FF]', valColor: 'text-[#4B69FF]',
            active: filter.role === 'admin',
            onClick: () => updateFilter(p => ({ ...p, role: p.role === 'admin' ? 'all' : 'admin' })),
          },
          {
            label: 'Patient Logs', val: fetchedCount, sub: 'Click to filter',
            icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="8" r="3.5" stroke="#16A34A" strokeWidth="1.5"/><path d="M4 19c0-3.866 3.134-7 7-7h0c3.866 0 7 3.134 7 7" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round"/></svg>,
            bg: 'bg-green-50', valColor: 'text-green-600',
            active: filter.role === 'patient',
            onClick: () => updateFilter(p => ({ ...p, role: p.role === 'patient' ? 'all' : 'patient' })),
          },
          {
            label: 'Showing Now', val: total, sub: hasFilters ? 'After filters' : 'No active filters',
            icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8.5" stroke="#F59E0B" strokeWidth="1.5"/><path d="M11 7v4l3 2" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/></svg>,
            bg: 'bg-amber-50', valColor: 'text-amber-600',
            active: false, onClick: undefined,
          },
        ].map((s, i) => (
          <button key={i} onClick={s.onClick}
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-200
              ${s.active
                ? 'border-brand-primary bg-white shadow-lg shadow-brand-primary/10 -translate-y-0.5'
                : `${s.bg} border-transparent hover:border-gray-200 hover:shadow-md ${s.onClick ? 'hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'}`
              }`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${s.active ? 'bg-brand-lighter' : 'bg-white'}`}>
              {s.icon}
            </div>
            <div className="min-w-0">
              <p className={`font-poppins font-black text-[26px] leading-none tracking-tight ${s.active ? 'text-brand-primary' : s.valColor}`}>
                {s.val}
              </p>
              <p className="text-[12px] font-bold text-gray-500 mt-1 leading-tight">{s.label}</p>
              <p className="text-[10.5px] text-gray-300 mt-0.5 leading-tight">{s.sub}</p>
            </div>
          </button>
        ))}
      </div>

      {/* ══ FILTER BAR ═══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3 flex-wrap">

        {/* Role tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-0.5">
          {(['all', 'admin', 'patient'] as const).map(r => (
            <button key={r} onClick={() => updateFilter(p => ({ ...p, role: r }))}
              className={`px-3.5 h-8 rounded-lg text-[12px] font-bold capitalize transition-all
                ${filter.role === r ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-500 hover:text-navy'}`}>
              {r === 'all' ? 'All Roles' : r === 'admin' ? '🛡 Admin' : '👤 Patient'}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-200" />

        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-[260px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input value={searchDraft} onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search endpoint, user, IP…"
            className="w-full h-9 pl-9 pr-3 bg-gray-50 rounded-xl text-[12.5px] font-medium text-navy placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-brand-primary/10 focus:bg-white border border-transparent focus:border-brand-primary/20 transition-all" />
          {searchDraft && (
            <button onClick={() => { setSearchDraft(''); updateFilter(p => ({ ...p, search: '' })) }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-500 text-[10px]">✕</button>
          )}
        </div>

        <div className="w-px h-6 bg-gray-200" />

        {/* Date range */}
        <div className="flex items-center gap-2">
          <label className="text-[12px] font-semibold text-gray-400 whitespace-nowrap">From</label>
          <input type="date" value={filter.startDate ? filter.startDate.slice(0, 10) : ''}
            onChange={e => updateFilter(p => ({ ...p, startDate: e.target.value ? new Date(e.target.value).toISOString() : '' }))}
            className={`h-9 px-3 rounded-xl border text-[12.5px] font-medium outline-none transition-all cursor-pointer
              ${filter.startDate ? 'bg-brand-lighter border-brand-primary/20 text-brand-primary' : 'bg-gray-50 border-transparent hover:bg-gray-100 text-gray-500'}`} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[12px] font-semibold text-gray-400 whitespace-nowrap">To</label>
          <input type="date" value={filter.endDate ? filter.endDate.slice(0, 10) : ''}
            onChange={e => updateFilter(p => ({ ...p, endDate: e.target.value ? new Date(e.target.value + 'T23:59:59').toISOString() : '' }))}
            className={`h-9 px-3 rounded-xl border text-[12.5px] font-medium outline-none transition-all cursor-pointer
              ${filter.endDate ? 'bg-brand-lighter border-brand-primary/20 text-brand-primary' : 'bg-gray-50 border-transparent hover:bg-gray-100 text-gray-500'}`} />
        </div>

        <div className="w-px h-6 bg-gray-200" />

        {/* ── Limit picker ── */}
        <LimitPicker limit={limit} onLimit={setLimit} />

        {hasFilters && (
          <button onClick={() => { setSearchDraft(''); updateFilter(() => ({ ...EMPTY_FILTER })) }}
            className="h-9 px-3 rounded-xl text-[12px] font-semibold text-gray-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all whitespace-nowrap">
            ✕ Clear
          </button>
        )}

        <span className="text-[12px] text-gray-400 ml-auto whitespace-nowrap">
          <span className="font-bold text-navy">{total}</span> of <span className="font-bold text-navy">{fetchedCount}</span> logs
        </span>
      </div>

      {/* ══ TABLE ════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <SectionLoader text="Loading activity logs…" />
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="5" y="4" width="22" height="24" rx="3" stroke="#D1D5DB" strokeWidth="1.8"/>
                <path d="M10 11h12M10 16h8M10 21h6" stroke="#D1D5DB" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="font-poppins font-bold text-[16px] text-navy">No logs found</p>
              <p className="text-[12.5px] text-gray-400 mt-1">Try adjusting your filters, date range, or limit</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  {COLS.map(col => (
                    <th key={col.label} className={`${col.w} px-4 py-3 text-left text-[10.5px] font-black uppercase tracking-widest text-gray-400`}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => {
                  const { date, time } = formatDateTime(log.createdAt)
                  const isExpanded     = expandedId === log._id

                  return (
                    <>
                      <tr key={log._id}
                        onClick={() => setExpandedId(isExpanded ? null : log._id)}
                        className={`border-b border-gray-50 cursor-pointer transition-colors
                          ${isExpanded ? 'bg-surface' : idx % 2 === 0 ? 'bg-white hover:bg-gray-50/60' : 'bg-gray-50/30 hover:bg-gray-50/80'}`}>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-brand-lighter flex items-center justify-center flex-shrink-0 text-[11px] font-black text-brand-primary">
                              {log.user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[12.5px] font-bold text-navy truncate leading-tight">{log.user?.name ?? '—'}</p>
                              <p className="text-[10.5px] text-gray-400 truncate leading-tight">{log.user?.email ?? '—'}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3"><RoleBadge role={log.role} /></td>
                        <td className="px-4 py-3"><MethodBadge method={log.method} /></td>

                        <td className="px-4 py-3 max-w-[260px]">
                          <p className="font-mono text-[11.5px] font-medium text-navy truncate" title={log.endpoint}>
                            {log.endpoint}
                          </p>
                        </td>

                        <td className="px-4 py-3"><StatusBadge code={log.statusCode} /></td>

                        <td className="px-4 py-3">
                          <span className="font-mono text-[12px] font-medium text-gray-500">{cleanIp(log.ipAddress)}</span>
                        </td>

                        <td className="px-4 py-3">
                          <span className="text-[12px] font-semibold text-gray-500">{parseUA(log.userAgent)}</span>
                        </td>

                        <td className="px-4 py-3">
                          <p className="text-[12px] font-semibold text-navy leading-tight">{date}</p>
                          <p className="text-[11px] text-gray-400 leading-tight">{time}</p>
                        </td>
                      </tr>

                      {isExpanded && <LogDrawer key={`drawer-${log._id}`} log={log} onClose={() => setExpandedId(null)} />}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ══ FOOTER: showing count ═════════════════════════════════════════ */}
      {!loading && logs.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3 flex items-center justify-between">
          <p className="text-[12.5px] text-gray-400">
            Showing <span className="font-bold text-navy">{total}</span> of{' '}
            <span className="font-bold text-navy">{fetchedCount}</span> fetched logs
            {hasFilters && <span className="text-gray-300"> · filters active</span>}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-gray-400">Change fetch limit:</span>
            <LimitPicker limit={limit} onLimit={setLimit} />
          </div>
        </div>
      )}
    </div>
  )
}
