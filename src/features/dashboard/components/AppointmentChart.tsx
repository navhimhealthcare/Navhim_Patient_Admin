// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
// } from "recharts";
// import Card, { CardHeader } from "../../../components/Card/Card";
// import Button from "../../../components/Button/Button";
// import { CHART_DATA } from "../dashboardAPI";

// const CustomTooltip = ({ active, payload, label }) => {
//   if (!active || !payload?.length) return null;
//   return (
//     <div className="bg-navy text-white text-xs rounded-xl px-3 py-2 shadow-lg border border-white/10">
//       <p className="font-bold mb-1">{label}</p>
//       {payload.map((p) => (
//         <p key={p.name} className="flex gap-2">
//           <span style={{ color: p.fill }}>{p.name}</span>
//           <span>{p.value}</span>
//         </p>
//       ))}
//     </div>
//   );
// };

// export default function AppointmentChart() {
//   return (
//     <Card>
//       <CardHeader
//         title="Appointment Overview"
//         subtitle="Monthly comparison — 2025"
//         action={
//           <Button variant="secondary" size="sm">
//             View Report
//           </Button>
//         }
//       />
//       <div className="px-5 pb-5 pt-4">
//         <div className="flex gap-5 mb-4">
//           <LegendDot color="#4B69FF" label="Completed" />
//           <LegendDot color="#ECF1FF" label="Scheduled" />
//         </div>
//         <ResponsiveContainer width="100%" height={290}>
//           <BarChart data={CHART_DATA} barGap={4} barCategoryGap="30%">
//             <CartesianGrid vertical={false} stroke="rgba(75,105,255,0.06)" />
//             <XAxis
//               dataKey="month"
//               tick={{ fontSize: 10, fill: "#ADADAD", fontFamily: "Inter" }}
//               axisLine={false}
//               tickLine={false}
//             />
//             <YAxis hide />
//             <Tooltip
//               content={<CustomTooltip />}
//               cursor={{ fill: "rgba(75,105,255,0.04)" }}
//             />
//             <Bar
//               dataKey="completed"
//               name="Completed"
//               fill="url(#blueGrad)"
//               radius={[4, 4, 0, 0]}
//             />
//             <Bar
//               dataKey="scheduled"
//               name="Scheduled"
//               fill="#e5eaf9ff"
//               radius={[4, 4, 0, 0]}
//             />
//             <defs>
//               <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="0%" stopColor="#4B69FF" />
//                 <stop offset="100%" stopColor="#2D3F99" />
//               </linearGradient>
//             </defs>
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </Card>
//   );
// }

// function LegendDot({ color, label }) {
//   return (
//     <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
//       <span className="w-2 h-2 rounded-full" style={{ background: color }} />
//       {label}
//     </div>
//   );
// }

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import Card, { CardHeader } from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
import { cn } from "../../../utils/helpers";
import { useDashboardAppOverview } from "../hooks/dashboardHooks";

// ── Types ──────────────────────────────────────────────────────────────────
interface AppointmentDataPoint {
  month: string; // "Jan", "Feb", …
  completed: number;
  upcoming: number;
  missed: number;
  cancelled: number;
}

// ── Status colour config ───────────────────────────────────────────────────
const STATUS_CFG = {
  completed: { color: "#10B981", label: "Completed" },
  upcoming: { color: "#F59E0B", label: "Upcoming" },
  missed: { color: "#64748B", label: "Missed" },
  cancelled: { color: "#EF4444", label: "Cancelled" },
} as const;

type StatusKey = keyof typeof STATUS_CFG;

// ── Helpers ────────────────────────────────────────────────────────────────
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const buildEmpty = (): AppointmentDataPoint[] =>
  MONTHS.map((m) => ({
    month: m,
    completed: 0,
    upcoming: 0,
    missed: 0,
    cancelled: 0,
  }));

const fmtY = (v: number) =>
  v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}K` : String(v);

// ── Custom Tooltip ─────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-brand-primary/10 rounded-xl px-4 py-3 shadow-xl min-w-[160px]">
      <p className="text-[12px] font-bold text-gray-500 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.stroke }} />
            <span className="text-[11.5px] font-semibold" style={{ color: p.stroke }}>{STATUS_CFG[p.dataKey as StatusKey]?.label}</span>
          </div>
          <span className="text-[12px] font-bold text-navy">{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

// ── Legend dot ─────────────────────────────────────────────────────────────
function LegendDot({
  color,
  label,
  active,
  onClick,
}: {
  color: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 text-[11.5px] font-semibold transition-all`}
      style={{ color: active ? color : "#ADADAD" }}
    >
      <span
        className="w-2 h-2.5 rounded-full flex-shrink-0 transition-all"
        style={{ background: active ? color : "#E5E7EB" }}
      />
      {label}
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function AppointmentChart({
  className,
}: {
  className?: string;
}) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [hidden, setHidden] = useState<Set<StatusKey>>(new Set());

  const { overviewData, loading } = useDashboardAppOverview(year);

  // Map API response → chart data
  // API returns: { month: "Jan", completed, upcoming, missed, cancelled }
  const chartData: AppointmentDataPoint[] = useMemo(() => {
    if (!overviewData.length) return buildEmpty();
    const base = buildEmpty();
    overviewData.forEach((item) => {
      const idx = MONTHS.indexOf(item.month);
      if (idx === -1) return;
      base[idx].completed = item.completed ?? 0;
      base[idx].upcoming = item.upcoming ?? 0;
      base[idx].missed = item.missed ?? 0;
      base[idx].cancelled = item.cancelled ?? 0;
    });
    return base;
  }, [overviewData]);

  const toggleStatus = (key: StatusKey) =>
    setHidden((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const total = useMemo(() => {
    const agg = { completed: 0, upcoming: 0, missed: 0, cancelled: 0 };
    chartData.forEach((d) => {
      agg.completed += d.completed;
      agg.upcoming += d.upcoming;
      agg.missed += d.missed;
      agg.cancelled += d.cancelled;
    });
    return agg;
  }, [chartData]);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader
        title="Appointment Overview"
        subtitle={`Monthly breakdown — ${year}`}
        action={
          <div className="flex items-center gap-2">
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="h-8 px-3 rounded-xl border border-brand-primary/15 bg-surface text-[12px] font-semibold text-navy outline-none cursor-pointer"
            >
              {[2023, 2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            {/* <Button variant="secondary" size="sm">View Report</Button> */}
          </div>
        }
      />

      {/* White chart area */}
      <div className="bg-white mt-6 px-5 pt-8 pb-6 border-t border-brand-primary/5">
        {/* Stat summary row */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {(
            Object.entries(STATUS_CFG) as [
              StatusKey,
              (typeof STATUS_CFG)[StatusKey],
            ][]
          ).map(([key, cfg]) => (
            <div key={key} className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: cfg.color }}
                />
                <span
                  className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400"
                >
                  {cfg.label}
                </span>
              </div>
              <p
                className="font-poppins font-black text-[22px] leading-none tracking-tight"
                style={{ color: cfg.color }}
              >
                {total[key].toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Legend toggles */}
        <div className="flex items-center gap-6 mb-6">
          {(
            Object.entries(STATUS_CFG) as [
              StatusKey,
              (typeof STATUS_CFG)[StatusKey],
            ][]
          ).map(([key, cfg]) => (
            <LegendDot
              key={key}
              color={cfg.color}
              label={cfg.label}
              active={!hidden.has(key)}
              onClick={() => toggleStatus(key)}
            />
          ))}
        </div>

        {/* Chart */}
        {loading ? (
          <div className="h-[260px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <svg
                className="animate-spin w-6 h-6 text-brand-primary"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M22 12A10 10 0 112 12"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              <p className="text-[12px] text-gray-400">Loading chart…</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
            >
              <defs>
                {(
                  Object.entries(STATUS_CFG) as [
                    StatusKey,
                    (typeof STATUS_CFG)[StatusKey],
                  ][]
                ).map(([key, cfg]) => (
                  <linearGradient
                    key={key}
                    id={`grad_${key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={cfg.color}
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="100%"
                      stopColor={cfg.color}
                      stopOpacity={0.01}
                    />
                  </linearGradient>
                ))}
              </defs>

              <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.03)" />

              <XAxis
                dataKey="month"
                tick={{
                  fontSize: 10,
                  fill: "#94A3B8",
                  fontFamily: "Inter",
                }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tickFormatter={fmtY}
                tick={{
                  fontSize: 10,
                  fill: "#94A3B8",
                  fontFamily: "Inter",
                }}
                axisLine={false}
                tickLine={false}
                width={36}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "rgba(0,0,0,0.05)",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />

              {(
                Object.entries(STATUS_CFG) as [
                  StatusKey,
                  (typeof STATUS_CFG)[StatusKey],
                ][]
              ).map(([key, cfg]) =>
                hidden.has(key) ? null : (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={cfg.color}
                    strokeWidth={2}
                    fill={`url(#grad_${key})`}
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: cfg.color,
                      stroke: "#FFFFFF",
                      strokeWidth: 2,
                    }}
                  />
                ),
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
