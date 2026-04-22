import { formatHospitalDate } from "../component/hospitalHelpers";
import locationIcon from "../../../assets/images/location.png";
import { Hospital } from "../component/types/hospital.types";
import editIcon from "../../../assets/images/edit.png";
import deleteIcon from "../../../assets/images/delete.png";
import hospitalsIcon from "../../../assets/images/hospital.png";
import { toTitleCase } from "../../../features/doctors/helpers/doctorHelper";
interface HospitalCardProps {
  hospital: Hospital;
  index: number;
  onEdit: (h: Hospital) => void;
  onDelete: (h: Hospital) => void;
}

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold
      ${active ? "bg-success-bg text-green-700" : "bg-gray-100 text-gray-400"}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${active ? "bg-green-500" : "bg-gray-300"}`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function InfoRow({
  icon,
  value,
  mono,
}: {
  icon: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-4 flex-shrink-0 flex items-center justify-center">
        {typeof icon === "string" && icon.length > 2 ? (
          <img src={icon} alt="icon" className="w-3.5 h-3.5 opacity-40" />
        ) : (
          <span className="text-sm">{icon}</span>
        )}
      </span>
      <span
        className={`text-[12px] text-gray-500 truncate ${mono ? "font-mono" : "font-medium"}`}
      >
        {value}
      </span>
    </div>
  );
}

function ActionBtn({
  children,
  title,
  color,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  color: "blue" | "red";
  onClick: () => void;
}) {
  const colors = {
    blue: "hover:bg-brand-lighter hover:text-brand-primary",
    red: "hover:bg-danger-bg hover:text-danger",
  };
  return (
    <button
      title={title}
      onClick={onClick}
      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm text-gray-400 transition-all ${colors[color]}`}
    >
      {children}
    </button>
  );
}

export default function HospitalCard({
  hospital: h,
  index,
  onEdit,
  onDelete,
}: HospitalCardProps) {
  return (
    <div
      style={{ animationDelay: `${index * 60}ms` }}
      className="bg-white rounded-2xl border border-brand-primary/[0.08] p-5 hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200 group animate-[fadeUp_0.35s_ease_both]"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 border border-brand-primary/10 flex items-center justify-center text-lg flex-shrink-0">
            <img
              src={hospitalsIcon}
              alt={"hospitals"}
              className="w-5 h-5 flex-shrink-0 object-contain opacity-90 group-hover:opacity-90 transition-opacity"
            />
          </div>
          <div>
            <p className="font-poppins font-bold text-[14px] text-navy leading-tight">
              {toTitleCase(h.name)}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <img
                src={locationIcon}
                alt="loc"
                className="w-2.5 h-2.5 opacity-40"
              />
              <p className="text-[10.5px] text-gray-300">{h.address}</p>
            </div>
          </div>
        </div>
        <ActiveBadge active={h.isActive} />
      </div>

      <div className="flex flex-col gap-2 mb-1">
        <InfoRow icon="📞" value={h.phone} />
        <InfoRow icon="✉️" value={h.email} />
        <InfoRow
          icon={locationIcon}
          value={`${h.location.coordinates[1].toFixed(4)}, ${h.location.coordinates[0].toFixed(4)}`}
          mono
        />
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-brand-primary/[0.07]">
        <p className="text-[11px] text-gray-300">
          Added {formatHospitalDate(h.createdAt)}
        </p>
        <div className="flex gap-1.5">
          <ActionBtn title="Edit" color="blue" onClick={() => onEdit(h)}>
            {" "}
            <img src={editIcon} alt="edit" className="w-3.5 h-3.5 opacity-70" />
          </ActionBtn>
          <ActionBtn title="Delete" color="red" onClick={() => onDelete(h)}>
            <img
              src={deleteIcon}
              alt="delete"
              className="w-3.5 h-3.5 opacity-70"
            />
          </ActionBtn>
        </div>
      </div>
    </div>
  );
}
