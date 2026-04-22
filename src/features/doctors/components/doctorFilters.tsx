import { DoctorFilter } from "../types/doctor.types";
import { DAYS, EXPERIENCE_OPTIONS } from "../helpers/doctorHelper";
import searchIcon from "../../../assets/images/search.png";

interface Props {
  filters: DoctorFilter;
  onChange: (f: Partial<DoctorFilter>) => void;
  onReset: () => void;
  specialties: { _id: string; name: string }[];
  hospitals: { _id: string; name: string }[];
  totalShown: number;
  total: number;
}

const selectCls =
  "h-9 border border-black/10 rounded-xl px-3 text-[12.5px] font-medium text-navy " +
  "bg-white outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all";

export default function DoctorFilters({
  filters,
  onChange,
  onReset,
  specialties,
  hospitals,
  totalShown,
  total,
}: Props) {
  const hasActive =
    Object.entries(filters).some(
      ([k, v]) => k !== "search" && k !== "status" && v !== "" && v !== "all",
    ) || filters.status !== "all";

  return (
    <div className="bg-white rounded-2xl border border-brand-primary/[0.08] px-5 py-4 flex flex-col gap-3">
      {/* Row 1: search + status + view count */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
        <img
            src={searchIcon}
            alt="Search"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-70"
          />
          <input
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Search by name, specialization, hospital…"
            className="w-full h-9 pl-8 pr-4 border border-black/10 rounded-xl text-[13px] font-medium text-navy placeholder:text-gray-300 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status tabs */}
        <div className="flex bg-surface rounded-xl p-0.5 gap-0.5">
          {(["all", "active", "inactive"] as const).map((s) => (
            <button
              key={s}
              onClick={() => onChange({ status: s })}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-all
                ${filters.status === s ? "bg-white text-brand-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
            >
              {s}
            </button>
          ))}
        </div>

        <span className="text-[12px] text-gray-300 font-medium ml-auto whitespace-nowrap">
          {totalShown} of {total}
        </span>
      </div>

      {/* Row 2: filters */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <select
          value={filters.specialty}
          onChange={(e) => onChange({ specialty: e.target.value })}
          className={selectCls}
        >
          <option value="">All Specialties</option>
          {specialties.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={filters.hospital}
          onChange={(e) => onChange({ hospital: e.target.value })}
          className={selectCls}
        >
          <option value="">All Hospitals</option>
          {hospitals?.map((h) => (
            <option key={h._id} value={h._id}>
              {h.name}
            </option>
          ))}
        </select>

        <select
          value={filters.day}
          onChange={(e) => onChange({ day: e.target.value })}
          className={selectCls}
        >
          <option value="">Any Day</option>
          {DAYS.map((d) => (
            <option key={d} value={d} className="capitalize">
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={filters.experience}
          onChange={(e) => onChange({ experience: e.target.value })}
          className={selectCls}
        >
          {EXPERIENCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* Fee range */}
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            placeholder="Min ₹"
            value={filters.minFees}
            onChange={(e) => onChange({ minFees: e.target.value })}
            className={`${selectCls} w-24`}
          />
          <span className="text-gray-300 text-xs">–</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={filters.maxFees}
            onChange={(e) => onChange({ maxFees: e.target.value })}
            className={`${selectCls} w-24`}
          />
        </div>

        {hasActive && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-danger-bg text-danger text-[12px] font-semibold hover:bg-red-100 transition-colors"
          >
            ✕ Reset
          </button>
        )}
      </div>
    </div>
  );
}
