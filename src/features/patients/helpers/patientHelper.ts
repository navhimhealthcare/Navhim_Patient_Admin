import { Patient, PatientFormValues, PatientFormAddValues, PatientFilter } from '../types/patient.types'

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
export const GENDERS      = ['male', 'female', 'other']

export const EMPTY_FORM: PatientFormValues = {
  avatar:           null,
  existingAvatar:   '',
  name:             '',
  email:            '',
  phone:            '',
  dob:              '',
  gender:           '',
  bloodGroup:       '',
  nfcCardNumber:    '',
  emergencyContact: '',
  height:           '',
  weight:           '',
  lat:              '',
  lng:              '',
  isActive:         true,
}

export const EMPTY_ADD_FORM: PatientFormAddValues = {
  name:   '',
  email:  '',
  phone:  '',
  dob:    '',
  gender: '',
}

export const formFromPatient = (p: Patient): PatientFormValues => ({
  avatar:           null,
  existingAvatar:   p.avatar ?? '',
  name:             p.name,
  email:            p.email,
  phone:            p.phone,
  dob:              p.dob?.split('T')[0] ?? '',
  gender:           p.gender,
  bloodGroup:       p.bloodGroup        ?? '',
  nfcCardNumber:    p.nfcCardNumber     ?? '',
  emergencyContact: p.emergencyContact  ?? '',
  height:           p.height  != null   ? String(p.height)  : '',
  weight:           p.weight  != null   ? String(p.weight)  : '',
  lat:              p.location?.coordinates?.[1] != null ? String(p.location.coordinates[1]) : '',
  lng:              p.location?.coordinates?.[0] != null ? String(p.location.coordinates[0]) : '',
  isActive:         p.isActive !== false,
})

// ── Add payload — only 5 fields ──────────────────────────────────────
export const buildAddPatientPayload = (form: PatientFormAddValues): PatientFormAddValues => ({
  name:   form.name.trim(),
  email:  form.email.trim(),
  phone:  form.phone.trim(),
  dob:    form.dob,
  gender: form.gender,
})

// ── Update payload — FormData with all fields ────────────────────────
export const buildUpdatePatientPayload = (form: PatientFormValues): FormData => {
  const fd = new FormData()

  if (form.avatar) {
    fd.append('avatar', form.avatar)
  } else if (form.existingAvatar) {
    fd.append('avatar', form.existingAvatar)
  }

  fd.append('name',   form.name.trim())
  fd.append('email',  form.email.trim())
  fd.append('phone',  form.phone.trim())
  fd.append('dob',    form.dob)
  fd.append('gender', form.gender)

  if (form.bloodGroup)       fd.append('bloodGroup',       form.bloodGroup)
  if (form.emergencyContact) fd.append('emergencyContact', form.emergencyContact)
  if (form.height)           fd.append('height',           form.height)
  if (form.weight)           fd.append('weight',           form.weight)
  fd.append('isActive', String(form.isActive))

  if (form.lat && form.lng) {
    fd.append('location', JSON.stringify({
      type:        'Point',
      coordinates: [parseFloat(form.lng), parseFloat(form.lat)],
    }))
  }

  return fd
}

export const validateAddForm = (
  form: PatientFormAddValues,
): Partial<Record<keyof PatientFormAddValues, string>> => {
  const errors: Partial<Record<keyof PatientFormAddValues, string>> = {}
  if (!form.name.trim())  errors.name   = 'Name is required'
  if (!form.email.trim()) errors.email  = 'Email is required'
  if (!form.phone.trim()) errors.phone  = 'Phone is required'
  if (!form.dob)          errors.dob    = 'Date of birth is required'
  if (!form.gender)       errors.gender = 'Gender is required'
  return errors
}

export const validateUpdateForm = (
  form: PatientFormValues,
): Partial<Record<keyof PatientFormValues, string>> => {
  const errors: Partial<Record<keyof PatientFormValues, string>> = {}
  if (!form.name.trim())  errors.name   = 'Name is required'
  if (!form.phone.trim()) errors.phone  = 'Phone is required'
  if (!form.email.trim()) errors.email  = 'Email is required'
  if (!form.dob)          errors.dob    = 'Date of birth is required'
  if (!form.gender)       errors.gender = 'Gender is required'
  if (form.lat && isNaN(parseFloat(form.lat))) errors.lat = 'Invalid latitude'
  if (form.lng && isNaN(parseFloat(form.lng))) errors.lng = 'Invalid longitude'
  return errors
}

export const calcAge = (dob: string): number => {
  const diff = Date.now() - new Date(dob).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

export const formatDob = (dob: string): string =>
  new Date(dob).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

export const filterPatients = (patients: Patient[], f: PatientFilter): Patient[] =>
  patients.filter(p => {
    if (!p) return false

    if (f.search) {
      const q = f.search.toLowerCase()
      const match =
        p.name.toLowerCase().includes(q)                   ||
        p.email.toLowerCase().includes(q)                  ||
        p.phone.includes(q)                                ||
        (p.nfcCardNumber ?? '').toLowerCase().includes(q)  ||
        (p.bloodGroup    ?? '').toLowerCase().includes(q)
      if (!match) return false
    }

    if (f.gender     && p.gender     !== f.gender)     return false
    if (f.bloodGroup && f.bloodGroup !== '' && p.bloodGroup !== f.bloodGroup) return false
    if (f.status === 'active'   && p.isActive === false) return false
    if (f.status === 'inactive' && p.isActive !== false) return false

    return true
  })

export const getPatientSummary = (patients: Patient[]) => {
  const valid = patients.filter(Boolean)
  return {
    total:   valid.length,
    male:    valid.filter(p => p.gender === 'male').length,
    female:  valid.filter(p => p.gender === 'female').length,
    active:  valid.filter(p => p.isActive !== false).length,
  }
}