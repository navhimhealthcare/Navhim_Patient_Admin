import { MedicineForm, PrescriptionForm } from '../types/prescription.types'

export const today = new Date().toISOString().slice(0, 10)

export const EMPTY_FORM: PrescriptionForm = {
  patientName: '', doctorId: '', doctorName: '', diagnosis: '', date: today,
}

export const EMPTY_MEDICINE: MedicineForm = {
  name: '', dosage: '', frequency: '', times: [], startDate: today, endDate: '',
}

export const TIME_OPTIONS = ['morning', 'afternoon', 'evening', 'night']

export const FREQUENCY_OPTIONS = [
  '1 time a day', '2 times a day', '3 times a day',
  'Every 8 hours', 'Every 12 hours', 'Once a week', 'As needed',
]

export const fmtDate = (iso: string) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const fmtShortDate = (iso: string) => {
  if (!iso) return ''
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

export const calcPrescriptionCompleteness = (
  patientName: string,
  doctorId:    string,
  diagnosis:   string,
  medCount:    number,
): number => {
  let done = 0
  if (patientName) done++
  if (doctorId)    done++
  if (diagnosis)   done++
  if (medCount > 0) done++
  return Math.round((done / 4) * 100)
}
