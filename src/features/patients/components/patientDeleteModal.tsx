import { Patient }     from '../types/patient.types'
import { SpinnerIcon } from '../../../components/Loader/Loader'
import { calcAge }     from '../helpers/patientHelper'

interface Props {
  open:      boolean
  patient:   Patient | null
  onClose:   () => void
  onConfirm: () => void
  loading:   boolean
}

export default function PatientDeleteModal({ open, patient, onClose, onConfirm, loading }: Props) {
  if (!open || !patient) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-[fadeUp_0.2s_ease_both]">
        <div className="w-14 h-14 rounded-2xl bg-danger-bg flex items-center justify-center text-3xl mx-auto mb-4">
          {patient.avatar
            ? <img src={patient.avatar} alt={patient.name} className="w-full h-full object-cover rounded-2xl" />
            : '👤'}
        </div>
        <h3 className="font-poppins font-bold text-[16px] text-navy text-center mb-1">Remove Patient?</h3>
        <p className="text-[13px] text-gray-400 text-center mb-1 leading-relaxed">
          Are you sure you want to remove{' '}
          <span className="font-bold text-navy">{patient.name}</span>?
        </p>
        <p className="text-[12px] text-gray-300 text-center mb-6">
          {calcAge(patient.dob)} yrs · {patient.gender} · {patient.nfcCardNumber}
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-500 hover:bg-surface transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-danger text-white text-[13px] font-semibold hover:bg-red-700 transition-colors disabled:opacity-60">
            {loading ? <SpinnerIcon size="sm" color="white" /> : '🗑️'} Remove
          </button>
        </div>
      </div>
    </div>
  )
}