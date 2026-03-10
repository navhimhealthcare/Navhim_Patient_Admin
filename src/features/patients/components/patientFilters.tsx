import { PatientFilter } from '../types/patient.types'
import { BLOOD_GROUPS, GENDERS } from '../helpers/patientHelper'
import searchIcon from "../../../assets/images/search.png";

interface Props {
  filters:    PatientFilter
  onChange:   (f: Partial<PatientFilter>) => void
  onReset:    () => void
  totalShown: number
  total:      number
}

const selCls =
  'h-9 border border-black/10 rounded-xl px-3 text-[12.5px] font-medium text-navy ' +
  'bg-white outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all'

export default function PatientFilters({ filters, onChange, onReset, totalShown, total }: Props) {
  const hasActive =
    filters.search !== '' || filters.gender !== '' ||
    filters.bloodGroup !== '' || filters.status !== 'all'
console.log('filters',filters);

  return (
    <div className="bg-white rounded-2xl border border-brand-primary/[0.08] px-5 py-4 flex flex-col gap-3">

      {/* Row 1 */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <img
            src={searchIcon}
            alt="Search"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-70"
          />
          <input
            value={filters.search}
            onChange={e => onChange({ search: e.target.value })}
            placeholder="Search by name, email, phone, NFC…"
            className="w-full h-9 pl-8 pr-4 border border-black/10 rounded-xl text-[13px] font-medium text-navy placeholder:text-gray-300 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all"
          />
          {filters.search && (
            <button onClick={() => onChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">✕</button>
          )}
        </div>

        {/* Status tabs */}
        <div className="flex bg-surface rounded-xl p-0.5 gap-0.5">
          {(['all', 'active', 'inactive'] as const).map(s => (
            <button key={s} onClick={() => onChange({ status: s })}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-all
                ${filters.status === s ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
              {s}
            </button>
          ))}
        </div>

        <span className="text-[12px] text-gray-300 font-medium ml-auto whitespace-nowrap">
          {totalShown} of {total}
        </span>
      </div>

      {/* Row 2 */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <select value={filters.gender} onChange={e => onChange({ gender: e.target.value })} className={selCls}>
          <option value="">All Genders</option>
          {GENDERS.map(g => <option key={g} value={g} className="capitalize">{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
        </select>

        <select value={filters.bloodGroup} onChange={e => onChange({ bloodGroup: e.target.value })} className={selCls}>
          <option value="">All Blood Groups</option>
          {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>

        {hasActive && (
          <button onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-danger-bg text-danger text-[12px] font-semibold hover:bg-red-100 transition-colors">
            ✕ Reset
          </button>
        )}
      </div>
    </div>
  )
}