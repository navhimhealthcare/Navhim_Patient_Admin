import { SpinnerIcon } from '../../../components/Loader/Loader'
import deleteIcon from '../../../assets/images/delete.png'

interface Props {
  open:      boolean
  onClose:   () => void
  onConfirm: () => void
  loading:   boolean
  title:     string
  name:      string
}

export default function DeleteModal({ open, onClose, onConfirm, loading, title, name }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-[fadeUp_0.2s_ease_both]">
        <div className="w-14 h-14 rounded-2xl bg-danger-bg flex items-center justify-center mx-auto mb-4">
          <img src={deleteIcon} alt="delete" className="w-7 h-7" />
        </div>
        <h3 className="font-poppins font-bold text-[16px] text-navy text-center mb-1">Delete {title}?</h3>
        <p className="text-[13px] text-gray-400 text-center mb-6 leading-relaxed">
          Are you sure you want to delete{' '}
          <span className="font-bold text-navy">"{name}"</span>?
          <br />This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-500 hover:bg-surface transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-danger text-white text-[13px] font-semibold hover:bg-red-700 transition-colors disabled:opacity-60">
            {loading ? <SpinnerIcon size="sm" color="white" /> : <img src={deleteIcon} alt="delete" className="w-4 h-4 brightness-0 invert" />} Delete
          </button>
        </div>
      </div>
    </div>
  )
}