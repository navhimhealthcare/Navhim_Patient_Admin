import { useNavigate } from "react-router-dom";
import Card, { CardHeader } from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
import Avatar from "../../../components/Avatar/Avatar";
import StatusBadge from "../../../components/Badge/StatusBadge";
import { useDashboardAppRecent } from "../hooks/dashboardHooks";
import showToast from "../../../utils/toast";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount: number): string {
  return amount > 0 ? `₹${amount.toLocaleString("en-IN")}` : "—";
}

export default function AppointmentsTable({
  className,
}: {
  className?: string;
}) {
  const navigate = useNavigate();
  const { recentAppointments, loading } = useDashboardAppRecent();

  const handleRowClick = (row: { patientName: string; doctorName: string }) => {
    showToast.info(
      `Viewing appointment for ${row.patientName} with ${row.doctorName}`,
    );
  };

  const handleViewAll = () => {
    // showToast.info('Loading all appointments…')
    setTimeout(() => navigate("/app/appointments"), 600);
  };

  return (
    <Card className={className}>
      <CardHeader
        title="Recent Appointments"
        subtitle="Latest activity"
        action={
          <Button variant="secondary" size="sm" onClick={handleViewAll}>
            View All
          </Button>
        }
      />
      <div className="px-5 pb-5 pt-3 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-sm text-gray-400">
            Loading appointments…
          </div>
        ) : recentAppointments.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-sm text-gray-400">
            No recent appointments found.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr>
                {["Patient", "Doctor", "Date & Time", "Status", "Amount"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-[11px] font-bold uppercase tracking-widest text-gray-300 pb-2.5 border-b border-brand-primary/[0.07]"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {recentAppointments.slice(0, 6).map((row, idx) => (
                <tr
                  key={idx}
                  onClick={() => handleRowClick(row)}
                  className="border-b border-brand-primary/[0.05] last:border-0 hover:bg-surface transition-colors cursor-pointer group"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        name={row.patientName}
                        size="sm"
                        index={idx % 4}
                        shape="circle"
                      />
                      <div>
                        <p className="text-[13px] font-bold text-navy leading-none group-hover:text-brand-primary transition-colors">
                          {row.patientName}
                        </p>
                        <p className="text-[11px] text-gray-300 mt-0.5">
                          {row.specialization}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-[12.5px] text-gray-500">
                    {row.doctorName}
                  </td>
                  <td className="py-3 pr-4">
                    <p className="text-[12.5px] text-gray-500">
                      {formatDate(row.date)}
                    </p>
                    <p className="text-[11px] text-gray-300 mt-0.5">
                      {row.time}
                    </p>
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="py-3 text-[13px] font-bold text-navy">
                    {formatAmount(row.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}
