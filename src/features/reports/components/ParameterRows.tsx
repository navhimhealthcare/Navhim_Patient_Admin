import { ResultRow } from "../types/labReport.types";
import { QUICK_PARAMS } from "../utils/constants";
import { isAbnormal, getSuggestiveValue } from "../utils/helpers";
import { SidebarSection } from "./FormFields";

interface Props {
  results: ResultRow[];
  errors: Record<string, string>;
  onAdd: () => void;
  onRemove: (idx: number) => void;
  onChange: (idx: number, key: keyof ResultRow, val: string) => void;
  onQuick: (preset: ResultRow) => void;
}

export default function ParameterRows({
  results,
  errors,
  onAdd,
  onRemove,
  onChange,
  onQuick,
}: Props) {
  return (
    <div>
      <SidebarSection
        icon={
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M4.5 1.5v4L2 9.5h8L7.5 5.5v-4M3.5 1.5h5"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
        title="Test Parameters"
        action={
          <button
            type="button"
            onClick={onAdd}
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
            Add Row
          </button>
        }
      />

      {/* Column headers */}
      <div
        className="grid gap-2 mb-2"
        style={{ gridTemplateColumns: "1fr 0.8fr 0.9fr 24px" }}
      >
        {["Parameter", "Value", "Normal Range", ""].map((h) => (
          <p
            key={h}
            className="text-[9px] font-black uppercase tracking-widest text-white/20 px-0.5"
          >
            {h}
          </p>
        ))}
      </div>

      {/* Input rows */}
      <div
        className="flex flex-col gap-1.5 max-h-[240px] overflow-y-auto -mr-1 pr-1"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.1) transparent",
        }}
      >
        {results.map((row, idx) => (
          <div
            key={idx}
            className="grid gap-2 items-start"
            style={{ gridTemplateColumns: "1fr 0.8fr 0.9fr 24px" }}
          >
            {/* Parameter name */}
            <div>
              <input
                value={row.name}
                onChange={(e) => onChange(idx, "name", e.target.value)}
                placeholder="Hemoglobin"
                className={`w-full h-8 px-2.5 rounded-lg text-[11.5px] font-medium text-white placeholder:text-white/20 outline-none transition-all bg-white/5 border
                  ${errors[`r_${idx}_name`] ? "border-red-400/50" : "border-white/10 focus:border-brand-light/40 hover:border-white/20"}`}
              />
              {errors[`r_${idx}_name`] && (
                <p className="text-[9.5px] text-red-400 mt-0.5">
                  {errors[`r_${idx}_name`]}
                </p>
              )}
            </div>
            {/* Value */}
            <div>
              <input
                value={row.value}
                onChange={(e) => onChange(idx, "value", e.target.value)}
                placeholder={getSuggestiveValue(row.normalRange)}
                className={`w-full h-8 px-2.5 rounded-lg text-[11.5px] font-medium text-white placeholder:text-white/20 outline-none transition-all bg-white/5 border
                  ${errors[`r_${idx}_value`] ? "border-red-400/50" : "border-white/10 focus:border-brand-light/40 hover:border-white/20"}
                  ${row.value && isAbnormal(row) ? "!border-red-400/40 bg-red-400/10" : ""}`}
              />
              {errors[`r_${idx}_value`] && (
                <p className="text-[9.5px] text-red-400 mt-0.5">
                  {errors[`r_${idx}_value`]}
                </p>
              )}
            </div>
            {/* Normal range */}
            <input
              value={row.normalRange}
              onChange={(e) => onChange(idx, "normalRange", e.target.value)}
              placeholder="13-17"
              className="w-full h-8 px-2.5 rounded-lg text-[11.5px] font-medium text-white placeholder:text-white/20 outline-none transition-all bg-white/5 border border-white/10 focus:border-brand-light/40 hover:border-white/20"
            />
            {/* Remove */}
            <button
              type="button"
              onClick={() => results.length > 1 && onRemove(idx)}
              disabled={results.length === 1}
              className="w-6 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                <path
                  d="M1.5 4.5h6"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Quick add presets */}
      <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2.5 border-t border-white/[0.06]">
        <span className="text-[9.5px] font-bold text-white/20 self-center uppercase tracking-widest">
          Quick:
        </span>
        {QUICK_PARAMS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => onQuick(p)}
            className="text-[10px] font-semibold text-white/35 bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg hover:bg-brand-primary/20 hover:text-brand-light hover:border-brand-primary/30 transition-all"
          >
            +{p.name}
          </button>
        ))}
      </div>
    </div>
  );
}
