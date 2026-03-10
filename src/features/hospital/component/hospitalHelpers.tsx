import { HospitalFormValues, Hospital } from '../component/types/hospital.types'

export const formatHospitalDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-IN', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  })

export const buildHospitalPayload = (form: HospitalFormValues) => ({
  name:     form.name.trim(),
  address:  form.address.trim(),
  phone:    form.phone.trim(),
  email:    form.email.trim().toLowerCase(),
  isActive: form.isActive,
  location: {
    type:        'Point' as const,
    coordinates: [
      parseFloat(form.lng) || 0,
      parseFloat(form.lat) || 0,
    ] as [number, number],
  },
})

export const formFromHospital = (h: Hospital): HospitalFormValues => ({
  name:     h.name,
  address:  h.address,
  phone:    h.phone,
  email:    h.email,
  lat:      String(h.location.coordinates[1]),
  lng:      String(h.location.coordinates[0]),
  isActive: h.isActive,
})

export const validateHospitalForm = (
  form: HospitalFormValues,
): Partial<Record<keyof HospitalFormValues, string>> => {
  const errors: Partial<Record<keyof HospitalFormValues, string>> = {}

  if (!form.name.trim())
    errors.name = 'Hospital name is required'

  if (!form.address.trim())
    errors.address = 'Address is required'

  if (form.phone && !/^\d{10}$/.test(form.phone))
    errors.phone = 'Enter a valid 10-digit phone number'

  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email))
    errors.email = 'Enter a valid email address'

  if (form.lat && isNaN(parseFloat(form.lat)))
    errors.lat = 'Enter a valid latitude'

  if (form.lng && isNaN(parseFloat(form.lng)))
    errors.lng = 'Enter a valid longitude'

  return errors
}

export const filterHospitals = (
  hospitals: Hospital[],
  search: string,
  status: 'all' | 'active' | 'inactive',
): Hospital[] =>
  hospitals.filter(h => {
    const q = search.toLowerCase()
    const matchSearch =
      !search ||
      h.name.toLowerCase().includes(q)    ||
      h.address.toLowerCase().includes(q) ||
      h.email.toLowerCase().includes(q)   ||
      h.phone.includes(q)

    const matchStatus =
      status === 'all' ||
      (status === 'active' ? h.isActive : !h.isActive)

    return matchSearch && matchStatus
  })

export const getHospitalSummary = (hospitals: Hospital[]) => ({
  total:    hospitals.length,
  active:   hospitals.filter(h => h.isActive).length,
  inactive: hospitals.filter(h => !h.isActive).length,
})