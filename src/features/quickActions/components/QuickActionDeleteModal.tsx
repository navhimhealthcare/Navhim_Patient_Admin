import { useEffect, useState } from "react";
import { QuickAction } from "../types/quickAction.types";
import { SpinnerIcon } from "../../../components/Loader/Loader";

interface Props {
  open: boolean;
  action: QuickAction | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function QuickActionDeleteModal({
  open,
  action,
  loading,
  onClose,
  onConfirm,
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) setTimeout(() => setVisible(true), 10);
    else setVisible(false);
  }, [open]);

  if (!open || !action) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`
          absolute inset-0 bg-navy/60 backdrop-blur-sm
          transition-opacity duration-300
          ${visible ? "opacity-100" : "opacity-0"}
        `}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`
          relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6
          transition-all duration-300 ease-out
          ${visible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-95"
          }
        `}
      >
        {/* Image or fallback */}
        {action.icon ? (
          <img
            src={action.icon}
            alt={action.title}
            className="w-16 h-16 rounded-2xl object-cover mx-auto mb-4 border-2 border-danger/20"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center text-3xl mx-auto mb-4">
            ⚡
          </div>
        )}

        <h3 className="font-poppins font-bold text-[16px] text-navy text-center mb-1">
          Remove Quick Action?
        </h3>
        <p className="text-[13px] text-gray-400 text-center mb-6 leading-relaxed">
          Are you sure you want to remove{" "}
          <span className="font-bold text-navy">{action.title}</span>?
          <br />
          This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-500 hover:bg-surface transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-danger text-white text-[13px] font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {loading ? <SpinnerIcon size="sm" color="white" /> : "🗑️"} Remove
          </button>
        </div>
      </div>
    </div>
  );
}
