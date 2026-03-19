import { Doctor } from "../types/doctor.types";
import { formatFee } from "../helpers/doctorHelper";
import editIcon from "../../../assets/images/edit.png";
import deleteIcon from "../../../assets/images/delete.png";
interface Props {
  doctor: Doctor;
  index: number;
  onEdit: (d: Doctor) => void;
  onDelete: (d: Doctor) => void;
  onToggle: (d: Doctor) => void;
}

function StatPill({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="text-center">
      <p
        className={`font-poppins font-bold text-[13px] ${color || "text-navy"}`}
      >
        {value}
      </p>
      <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

export default function DoctorCard({
  doctor: d,
  index,
  onEdit,
  onDelete,
  onToggle,
}: Props) {
  return (
    <div
      style={{ animationDelay: `${index * 55}ms` }}
      className="bg-white rounded-2xl border border-brand-primary/[0.08] overflow-hidden hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200 animate-[fadeUp_0.35s_ease_both] group"
    >
      {/* Top banner */}
      <div className="h-1.5 bg-gradient-to-r from-brand-primary to-brand-gradient" />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-4">
          <div className="relative flex-shrink-0">
            {d.profileImage ? (
              <img
                src={d.profileImage}
                alt={d.name}
                className="w-14 h-14 rounded-xl object-cover border-2 border-brand-primary/10"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-primary/15 to-brand-primary/5 flex items-center justify-center text-2xl border border-brand-primary/10">
                🩺
              </div>
            )}
            {/* Active dot */}
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${d.isActive ? "bg-success" : "bg-gray-300"}`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-poppins font-bold text-[13.5px] text-navy leading-tight truncate">
              {d.name}
            </p>
            <p className="text-[11.5px] text-brand-primary font-semibold mt-0.5">
              {d.specialization?.name || "N/A"}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5 truncate">
              🏥 {d.hospital?.name || "N/A"}
            </p>
          </div>

          {/* Fee pill */}
          <div
            className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold
            ${d.isFree ? "bg-success-bg text-green-700" : "bg-brand-lighter text-brand-primary"}`}
          >
            {formatFee(d.consultationFee, d.isFree)}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 border-t border-brand-primary/[0.07] pt-3.5 mb-4">
          <StatPill label="Exp" value={`${d.experienceYears}y`} />
          <StatPill
            label="Rating"
            value={d.rating ? `⭐ ${d.rating}` : "—"}
            color="text-warning"
          />
          <StatPill label="Patients" value={String(d.patientsCount)} />
          <StatPill label="Reviews" value={String(d.reviewsCount)} />
        </div>

        {/* Availability chips */}
        {d.availability && d.availability.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {d.availability.slice(0, 4).map((a) => (
              <span
                key={a._id}
                className="px-2 py-0.5 bg-surface text-[10.5px] font-semibold text-gray-500 rounded-lg capitalize"
              >
                {a.day.slice(0, 3)}
              </span>
            ))}
            {d.availability.length > 4 && (
              <span className="px-2 py-0.5 bg-surface text-[10.5px] font-semibold text-gray-400 rounded-lg">
                +{d.availability.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            // onClick={() => onToggle(d)}
            className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-not-allowed
              ${d.isActive ? "bg-success-bg text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-400 hover:bg-gray-200" }`}
          >
            {d.isActive ? "✅ Active" : "⛔ Inactive"}
          </button>
          <button
            onClick={() => onEdit(d)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-brand-lighter text-brand-primary text-[12px] font-semibold hover:bg-brand-soft transition-colors"
          >
            <img src={editIcon} alt="edit" className="w-3.5 h-3.5 opacity-70" />
            Edit
          </button>
          <button
            onClick={() => onDelete(d)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-danger-bg text-danger hover:bg-red-100 transition-colors"
          >
            <img
              src={deleteIcon}
              alt="delete"
              className="w-3.5 h-3.5 opacity-70"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
