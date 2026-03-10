import { Hospital } from "../component/types/hospital.types";
import { SpinnerIcon } from "../../../components/Loader/Loader";
import deleteIcon from "../../../assets/images/delete.png";
interface DeleteModalProps {
  open: boolean;
  hospital: Hospital | null;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export default function HospitalDeleteModal({
  open,
  hospital,
  onClose,
  onConfirm,
  loading,
}: DeleteModalProps) {
  if (!open || !hospital) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-[fadeUp_0.2s_ease_both]">
        <div className="w-16 h-16 rounded-2xl  flex items-center justify-center text-3xl mx-auto mb-4">
          <img
            src={deleteIcon}
            alt="delete"
            className="w-3.8 h-3.8 opacity-70"
          />
        </div>
        <h3 className="font-poppins font-bold text-[16px] text-navy text-center mb-2">
          Delete Hospital?
        </h3>
        <p className="text-[13px] text-gray-400 text-center mb-6 leading-relaxed">
          Are you sure you want to delete{" "}
          <span className="font-bold text-navy">"{hospital.name}"</span>?
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
            className="flex-1 flex items-center justify-center bg-red-500  gap-5 py-2.5 rounded-xl bg-danger-bg text-white text-[13px] font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <SpinnerIcon size="sm" color="white" />
            ) : (
              ""
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
