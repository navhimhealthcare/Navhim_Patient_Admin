import { DepartmentLoad, TopDoctors } from "../components/DoctorWidgets";
import {
  StatCardSkeleton,
  SectionLoader,
} from "../../../components/Loader/Loader";
import { useDashboardCounts } from "../hooks/dashboardHooks";

import AppointmentChart from "../components/AppointmentChart";
import AppointmentsTable from "../components/AppointmentsTable";
import QuickActions from "../components/QuickActions";
import StatCard from "../components/StatCard";
import QuickActionsPage from "../../quickActions/page/QuickActionsPage";

const STAT_CONFIG = [
  {
    key: "totalPatients" as const,
    label: "Total Patients",
    icon: "👥",
    color: "blue" as const,
    note: "registered patients",
  },
  {
    key: "todaysAppointments" as const,
    label: "Appointments Today",
    icon: "📅",
    color: "green" as const,
    note: "scheduled today",
  },
  {
    key: "totalHospitals" as const,
    label: "Total Hospitals",
    icon: "🏥",
    color: "yellow" as const,
    note: "partner hospitals",
  },
  {
    key: "activeDoctors" as const,
    label: "Active Doctors",
    icon: "🩺",
    color: "red" as const,
    note: "currently active",
  },
];

export default function DashboardPage() {
  const { counts, loading: statsLoading } = useDashboardCounts();

  return (
    <div className="flex flex-col gap-6">
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-4 gap-5">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : STAT_CONFIG.map((cfg, i) => (
              <div
                key={cfg.key}
                style={{ animationDelay: `${i * 60}ms` }}
                className="animate-[fadeUp_0.4s_ease_both]"
              >
                <StatCard
                  label={cfg.label}
                  value={counts?.[cfg.key] ?? 0}
                  icon={cfg.icon}
                  color={cfg.color}
                  note={cfg.note}
                />
              </div>
            ))}
      </div>

      {/* ── Chart + Top Doctors ── */}
      <div className="grid grid-cols-[1fr_360px] gap-5">
        <AppointmentChart className="h-full" />
        <TopDoctors className="h-full" />
      </div>

      {/* ── Recent Appointments + Side widgets ── */}
      <div className="grid grid-cols-[1fr_360px] gap-5">
        <AppointmentsTable className="h-full" />
        <div className="grid grid-cols-1 gap-5">
          <DepartmentLoad className="h-full" />
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <QuickActionsPage />
      <QuickActionsPage staticActions={true}/>
      {/* <QuickActions /> */}
    </div>
  );
}
