import { useNavigate } from "react-router-dom";
import editIcon from "../../../assets/images/edit.png";
import deleteIcon from "../../../assets/images/delete.png";
import { QuickAction } from "../types/quickAction.types";

interface Props {
  action: QuickAction;
  index: number;
  onEdit: (qa: QuickAction) => void;
  onDelete: (qa: QuickAction) => void;
}

export default function QuickActionCard({
  action: qa,
  index,
  onEdit,
  onDelete,
}: Props) {
  const navigate = useNavigate();
  const isStatic = qa.isStatic;
  const displayTitle = qa.title || qa.name || "";
  const displayIcon = qa.icon || qa.image || "⚡";

  const handleNav = () => {
    if (isStatic && qa.path) {
      navigate(qa.path);
      return;
    }

    // Special mapping for dynamic actions as per user request
    const titleLower = displayTitle.toLowerCase();
    if (titleLower.includes("hospital")) {
      navigate("/app/hospital");
    } else if (
      titleLower.includes("book doctor") ||
      titleLower.includes("appointment")
    ) {
      navigate("/app/appointments");
    } else if (titleLower.includes("report")) {
      navigate("/app/patients");
    } else {
      navigate(`/quick-actions/${qa._id}`);
    }
  };

  return (
    <div
      style={{ animationDelay: `${index * 60}ms` }}
      className="
        relative bg-white rounded-xl border border-brand-primary/[0.08]
        overflow-visible group
        hover:shadow-md hover:border-brand-primary/20
        transition-all duration-250 ease-out
        animate-[fadeUp_0.35s_ease_both]
      "
    >
      {/* ── Top-right action buttons ─────────────────────────────────────── */}
      {!isStatic && (
        <div
          className="
            absolute -top-2.5 -right-2.5 z-20
            flex items-center gap-1
            opacity-0 group-hover:opacity-100
            scale-75 group-hover:scale-100
            transition-all duration-200 ease-out
          "
        >
          {/* Edit */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(qa);
            }}
            title="Edit"
            className="
              w-7 h-7 rounded-lg bg-white border border-brand-primary/20
              flex items-center justify-center shadow-md
              hover:bg-brand-primary/10 hover:border-brand-primary/40
              hover:scale-110 active:scale-95
              transition-all duration-150
            "
          >
            <img src={editIcon} alt="Edit" className="w-3 h-3 object-contain" />
          </button>

          {/* Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(qa);
            }}
            title="Delete"
            className="
              w-7 h-7 rounded-lg bg-white border border-danger/20
              flex items-center justify-center shadow-md
              hover:bg-danger/10 hover:border-danger/40
              hover:scale-110 active:scale-95
              transition-all duration-150
            "
          >
            <img
              src={deleteIcon}
              alt="Delete"
              className="w-3 h-3 object-contain"
            />
          </button>
        </div>
      )}

      {/* ── Clickable card body (navigates) ──────────────────────────────── */}
      <button
        onClick={handleNav}
        className="w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 rounded-xl"
      >
        <div className="px-3 pt-4 pb-3 flex flex-col items-center gap-2">
          {/* Image */}
          <div
            className="
              w-11 h-11 rounded-xl overflow-hidden flex-shrink-0
              bg-gradient-to-br from-brand-primary/10 to-brand-primary/5
              border border-brand-primary/10
              flex items-center justify-center
              group-hover:scale-105 group-hover:shadow-sm
              transition-all duration-250
            "
          >
            {displayIcon.match(/https?:\/\//) ||
            displayIcon.match(/\.(png|jpg|jpeg|svg|webp)/i) ? (
              <img
                src={displayIcon}
                alt={displayTitle}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg">{displayIcon}</span>
            )}
          </div>

          {/* Name */}
          <p className="font-poppins font-semibold text-[11px] text-navy text-center leading-tight line-clamp-2 w-full">
            {displayTitle}
          </p>

          {/* Tap hint */}
          <p className="text-[9px] text-brand-primary/60 font-medium opacity-0 group-hover:opacity-100 -mt-0.5 transition-opacity duration-200">
            Open →
          </p>
        </div>
      </button>
    </div>
  );
}
