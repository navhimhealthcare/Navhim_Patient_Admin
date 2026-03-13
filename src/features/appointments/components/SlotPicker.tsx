import { useState, useEffect } from "react";
import { SlotItem } from "../types/appointment.types";
import { appointmentService } from "../services/appointmentService";

interface Props {
  doctorId: string;
  date: string;
  selected: string;
  onSelect: (slot: string) => void;
  accentColor?: "brand" | "warning";
}

// Group slots by session
const SESSION_RANGES: {
  label: string;
  icon: string;
  from: number;
  to: number;
}[] = [
  { label: "Morning", icon: "🌅", from: 0, to: 12 },
  { label: "Afternoon", icon: "☀️", from: 12, to: 17 },
  { label: "Evening", icon: "🌆", from: 17, to: 21 },
];

const slotHour = (slot: string): number => {
  const time = slot.split("-")[0];
  const [hm, period] = [time.slice(0, -2), time.slice(-2)];
  let h = parseInt(hm.split(":")[0]);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h;
};

export default function SlotPicker({
  doctorId,
  date,
  selected,
  onSelect,
  accentColor = "brand",
}: Props) {
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!doctorId || !date) {
      setSlots([]);
      return;
    }
    setLoading(true);
    setError("");
    setSlots([]);
    appointmentService
      .getAvailableSlots(doctorId, date)
      .then((res) => setSlots(res.data.data))
      .catch((err: any) => setError(err?.response?.data?.message))
      .finally(() => setLoading(false));
  }, [doctorId, date]);

  const available = slots.filter((s) => s.availability === "true");
  const total = slots.length;

  const active =
    accentColor === "brand"
      ? "bg-brand-primary border-brand-primary text-white shadow-sm"
      : "bg-warning border-warning text-white shadow-sm";

  const hoverAvail =
    accentColor === "brand"
      ? "border-brand-primary/30 hover:border-brand-primary hover:bg-brand-lighter"
      : "border-warning/30 hover:border-warning hover:bg-warning/5";

  if (!doctorId || !date)
    return (
      <div className="flex items-center justify-center gap-2 py-8 bg-surface rounded-2xl border border-dashed border-gray-200">
        <span className="text-gray-300 text-sm">
          {!doctorId
            ? "👆 Select a doctor first"
            : "👆 Pick a date to see slots"}
        </span>
      </div>
    );

  if (loading)
    return (
      <div className="flex items-center justify-center gap-2 py-8 bg-surface rounded-2xl">
        <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-[12px] text-gray-400 font-medium">
          Fetching available slots…
        </span>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center gap-2 py-6 bg-danger-bg rounded-2xl border border-danger/10">
        <span className="text-sm text-danger font-medium">⚠️ {error}</span>
      </div>
    );

  if (total === 0)
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 bg-surface rounded-2xl border border-dashed border-gray-200">
        <span className="text-2xl">😕</span>
        <p className="text-[12.5px] font-semibold text-gray-400">
          No slots available for this date
        </p>
      </div>
    );

  return (
    <div className="flex flex-col gap-3">
      {/* Stats row */}
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold text-gray-500">
          {available.length} of {total} slots available
        </span>
        <div className="flex items-center gap-3 text-[11px] font-medium text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-brand-primary/20 border border-brand-primary/30" />
            Available
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-gray-100 border border-gray-200" />
            Booked
          </span>
        </div>
      </div>

      {/* Sessions */}
      {SESSION_RANGES.map((session) => {
        const sessionSlots = slots.filter((s) => {
          const h = slotHour(s.slot);
          return h >= session.from && h < session.to;
        });
        if (sessionSlots.length === 0) return null;
        return (
          <div key={session.label}>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <span>{session.icon}</span> {session.label}
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {sessionSlots.map((s) => {
                const isAvail = s.availability === "true";
                const isSel = selected === s.slot;
                const startTime = s.slot.split("-")[0];
                return (
                  <button
                    key={s.slot}
                    type="button"
                    disabled={!isAvail}
                    onClick={() => isAvail && onSelect(s.slot)}
                    className={`py-1.5 px-1 rounded-xl text-[11.5px] font-semibold border transition-all text-center
                      ${
                        isSel
                          ? active
                          : isAvail
                            ? `bg-white ${hoverAvail} text-gray-600`
                            : "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed line-through"
                      }`}
                  >
                    {startTime}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Selected slot pill */}
      {selected && (
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold
          ${accentColor === "brand" ? "bg-brand-lighter text-brand-primary" : "bg-warning/10 text-warning"}`}
        >
          ✓ Selected: <span className="font-bold">{selected}</span>
        </div>
      )}
    </div>
  );
}
