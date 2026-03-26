import Card, { CardHeader } from "../../../components/Card/Card";
import Avatar from "../../../components/Avatar/Avatar";
import ProgressBar from "../../../components/ProgressBar/ProgressBar";
import showToast from "../../../utils/toast";
import { useDashboardDepartmentsLoad, useDashboardTopDoctors } from "../hooks/dashboardHooks";

const DEPARTMENT_COLORS: Record<string, any> = {
  "General Physician": "green",
  "Dermatologist": "pink",
  "Common Health Issues": "red",
  "Neuro": "purple",
  "Orthopedist": "orange",
  "Cardiologys": "blue",
  "Neurology": "indigo",
  "Pediatrics": "pink",
  "Radiology": "cyan",
  "Pathology": "teal",
  "Choose from top specialties": "cyan",
  "Surgery": "yellow",
};

export function TopDoctors({ className }: { className?: string }) {
  const { topDoctors, loading, refetch } = useDashboardTopDoctors();
  const handleDoctorClick = (doc) => {
    showToast.info(`Viewing profile of ${doc.name} — ${doc.specialty}`);
  };

  return (
    <Card className={className}>
      <CardHeader title="Top Doctors" subtitle="By rating this month" />
      <div className="px-5 pb-4 pt-3 divide-y divide-brand-primary/[0.06]">
        {topDoctors?.slice(0, 6).map((doc, index) => (
          <div
            key={doc.doctorId}
            // onClick={() => handleDoctorClick(doc)}
            className="flex items-center gap-3 py-3 cursor-pointer hover:bg-surface -mx-5 px-5 transition-colors"
          >
            <Avatar
              name={doc.doctorName}
              size="md"
              index={index}
              shape="square"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-navy truncate hover:text-brand-primary transition-colors">
                {doc.doctorName}
              </p>
              <p className="text-[11.5px] text-gray-400 mt-0.5">
                {doc.specialization}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[12px] font-bold text-warning">
                ⭐ {doc.rating}
              </p>
              <p className="text-[11px] text-gray-300 mt-0.5">
                {doc.reviewsCount} reviews
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function DepartmentLoad({ className }: { className?: string }) {
  const { departmentsLoad, loading, refetch } = useDashboardDepartmentsLoad();
  const handleDeptClick = (dep) => {
    const level =
      dep.value >= 80 ? "warn" : dep.value >= 50 ? "info" : "success";
    const msgs = {
      warn: `⚠️ ${dep.name} is at high capacity (${dep.value}%). Consider reallocation.`,
      info: `${dep.name} is at moderate capacity (${dep.value}%).`,
      success: `${dep.name} has comfortable capacity (${dep.value}%).`,
    };
    showToast[level](msgs[level]);
  };

  return (
    <Card>
      <CardHeader title="Department Load" subtitle="Capacity utilization" />
      <div className="px-5 pb-5 pt-3 flex flex-col gap-4">
        {departmentsLoad?.map((dep) => (
          <div
            key={dep.department}
            // onClick={() => handleDeptClick(dep)}
            className="cursor-pointer"
          >
            <ProgressBar 
              label={dep.department} 
              value={dep.utilization} 
              color={DEPARTMENT_COLORS[dep.department] || "blue"} 
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
