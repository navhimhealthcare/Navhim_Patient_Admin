import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import Card, { CardHeader } from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
import { CHART_DATA } from "../dashboardAPI";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy text-white text-xs rounded-xl px-3 py-2 shadow-lg border border-white/10">
      <p className="font-bold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex gap-2">
          <span style={{ color: p.fill }}>{p.name}</span>
          <span>{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function AppointmentChart() {
  return (
    <Card>
      <CardHeader
        title="Appointment Overview"
        subtitle="Monthly comparison — 2025"
        action={
          <Button variant="secondary" size="sm">
            View Report
          </Button>
        }
      />
      <div className="px-5 pb-5 pt-4">
        <div className="flex gap-5 mb-4">
          <LegendDot color="#4B69FF" label="Completed" />
          <LegendDot color="#ECF1FF" label="Scheduled" />
        </div>
        <ResponsiveContainer width="100%" height={290}>
          <BarChart data={CHART_DATA} barGap={4} barCategoryGap="30%">
            <CartesianGrid vertical={false} stroke="rgba(75,105,255,0.06)" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: "#ADADAD", fontFamily: "Inter" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(75,105,255,0.04)" }}
            />
            <Bar
              dataKey="completed"
              name="Completed"
              fill="url(#blueGrad)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="scheduled"
              name="Scheduled"
              fill="#e5eaf9ff"
              radius={[4, 4, 0, 0]}
            />
            <defs>
              <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4B69FF" />
                <stop offset="100%" stopColor="#2D3F99" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      {label}
    </div>
  );
}
