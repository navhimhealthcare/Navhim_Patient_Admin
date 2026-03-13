import { useState, useEffect } from 'react'
import { Appointment, AppointmentRescheduleForm } from '../types/appointment.types'
import SlotPicker     from './SlotPicker'
import { SpinnerIcon } from '../../../components/Loader/Loader'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

// ══════════════════════════════════════════════════════════════════════
// RESCHEDULE MODAL
// ══════════════════════════════════════════════════════════════════════
interface RescheduleProps {
  open:        boolean
  onClose:     () => void
  onSubmit:    (form: AppointmentRescheduleForm) => Promise<boolean>
  appointment: Appointment | null
  loading:     boolean
}

export function RescheduleModal({ open, onClose, onSubmit, appointment, loading }: RescheduleProps) {
  const [appointmentDate, setAppointmentDate] = useState('')
  const [slot,   setSlot]   = useState('')
  const [errors, setErrors] = useState<{ appointmentDate?: string; slot?: string }>({})

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (open && appointment) {
      setAppointmentDate(appointment.appointmentDate.slice(0, 10))
      setSlot(appointment.slot)
      setErrors({})
    }
  }, [open, appointment])

  if (!open || !appointment) return null

  const handleSubmit = async () => {
    const e: typeof errors = {}
    if (!appointmentDate) e.appointmentDate = 'Date is required'
    if (!slot) e.slot = 'Please select a time slot'
    if (Object.keys(e).length) { setErrors(e); return }
    const ok = await onSubmit({ appointmentDate, slot })
    if (ok) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md animate-[fadeUp_0.25s_ease_both] overflow-hidden">

        {/* Amber header */}
        <div className="bg-gradient-to-r from-[#F59E0B] to-[#F97316] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg">🔄</div>
            <div>
              <h2 className="font-poppins font-bold text-white text-[16px]">Reschedule</h2>
              <p className="text-white/70 text-[11px]">Change date or time slot</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center text-sm transition-colors">✕</button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4 max-h-[65vh] overflow-y-auto scrollbar-hide">

          {/* Current info */}
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-white border border-amber-200">
              {appointment.doctor.profileImage
                ? <img src={appointment.doctor.profileImage} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center">👨‍⚕️</div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-bold text-navy truncate">{appointment.doctor.name}</p>
              <p className="text-[11px] text-amber-600 font-medium">
                Currently: {formatDate(appointment.appointmentDate)} · {appointment.slot}
              </p>
            </div>
          </div>

          {/* New date */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-gray-500">New Date <span className="text-danger">*</span></label>
            <input
              type="date"
              value={appointmentDate}
              min={today}
              onChange={e => { setAppointmentDate(e.target.value); setSlot('') }}
              className="w-full h-10 border border-black/10 rounded-xl px-3 text-[13px] font-medium text-navy outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10 transition-all bg-white"
            />
            {errors.appointmentDate && <p className="text-[11px] text-danger">{errors.appointmentDate}</p>}
          </div>

          {/* Slot picker */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-gray-500">New Time Slot <span className="text-danger">*</span></label>
            <SlotPicker
              doctorId={appointment.doctor._id}
              date={appointmentDate}
              selected={slot}
              onSelect={setSlot}
              accentColor="warning"
            />
            {errors.slot && <p className="text-[11px] text-danger mt-1">{errors.slot}</p>}
          </div>
        </div>

        <div className="px-6 pb-5 pt-4 flex gap-3 justify-end border-t border-black/[0.05]">
          <button onClick={onClose} disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-500 hover:bg-surface transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#F97316] text-white text-[13px] font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity shadow-sm">
            {loading && <SpinnerIcon size="sm" color="white" />}
            🔄 Reschedule
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// CANCEL MODAL
// ══════════════════════════════════════════════════════════════════════
interface CancelProps {
  open:        boolean
  onClose:     () => void
  onConfirm:   () => void
  appointment: Appointment | null
  loading:     boolean
}

export function CancelAppointmentModal({ open, onClose, onConfirm, appointment, loading }: CancelProps) {
  if (!open || !appointment) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm animate-[fadeUp_0.2s_ease_both] overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-danger to-rose-400" />

        <div className="p-6 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-danger-bg flex items-center justify-center text-3xl">❌</div>
          <div>
            <h3 className="font-poppins font-bold text-[16px] text-navy">Cancel Appointment?</h3>
            <p className="text-[12.5px] text-gray-400 mt-1.5 leading-relaxed">
              Appointment with <span className="font-bold text-navy">{appointment.doctor.name}</span>
              <br />on <span className="font-bold text-navy">{formatDate(appointment.appointmentDate)}</span>
              {' '}at <span className="font-bold text-navy">{appointment.slot}</span>
            </p>
          </div>

          {appointment.paymentStatus === 'unpaid' && (
            <div className="w-full bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-left">
              <p className="text-[12px] text-amber-600 font-semibold">⚠️ This appointment has an unpaid balance</p>
            </div>
          )}

          <div className="flex gap-3 w-full">
            <button onClick={onClose} disabled={loading}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-500 hover:bg-surface transition-colors disabled:opacity-50">
              Keep It
            </button>
            <button onClick={onConfirm} disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-danger text-white text-[13px] font-semibold hover:bg-red-700 transition-colors disabled:opacity-60">
              {loading ? <SpinnerIcon size="sm" color="white" /> : null}
              Cancel Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}