import { Doctor, DoctorFilter, DoctorFormValues } from "../types/doctor.types";

export const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const EXPERIENCE_OPTIONS = [
  { label: "Any", value: "" },
  { label: "0–5 yrs", value: "0-5" },
  { label: "5–10 yrs", value: "5-10" },
  { label: "10–15 yrs", value: "10-15" },
  { label: "15+ yrs", value: "15" },
];

export const EMPTY_FORM: DoctorFormValues = {
  profileImage: null,
  existingProfileImage: "",
  name: "",
  about: "",
  specializationId: "",
  hospitalId: "",
  experienceYears: "",
  consultationFee: "",
  isFree: false,
  isActive: true,
  availability: [],
};

export const formatFee = (fee: number, isFree: boolean) =>
  isFree ? "Free" : `₹${fee}`;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const buildDoctorPayload = (form: DoctorFormValues): FormData => {
  const fd = new FormData()

  if (form.profileImage) {
    // New file selected — upload it
    fd.append('profileImage', form.profileImage)
  } else if (form.existingProfileImage) {
    // No new file — send existing URL under same key "profileImage"
    fd.append('profileImage', form.existingProfileImage)
  }
  // If both empty — don't append profileImage at all (remove image)

  fd.append('name',            form.name.trim())
  fd.append('about',           form.about.trim())
  fd.append('specialization',  form.specializationId)
  fd.append('hospital',        form.hospitalId)
  fd.append('experienceYears', String(parseInt(form.experienceYears) || 0))
  fd.append('consultationFee', String(form.isFree ? 0 : parseFloat(form.consultationFee) || 0))
  fd.append('isFree',          String(form.isFree))
  fd.append('isActive',        String(form.isActive))
  fd.append('availability',    JSON.stringify(form.availability))

  return fd
}

export const formFromDoctor = (d: Doctor): DoctorFormValues => ({
  profileImage: null, // new file — always starts empty
  existingProfileImage: d.profileImage ?? "", // keep current URL
  name: d.name,
  about: d.about,
  specializationId: d.specialization._id,
  hospitalId: d.hospital._id,
  experienceYears: String(d.experienceYears),
  consultationFee: String(d.consultationFee),
  isFree: d.isFree,
  isActive: d.isActive,
  availability: d.availability.map((a) => ({ day: a.day, slots: a.slots })),
});

export const validateDoctorForm = (
  form: DoctorFormValues,
): Partial<Record<keyof DoctorFormValues, string>> => {
  const errors: Partial<Record<keyof DoctorFormValues, string>> = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (!form.specializationId)
    errors.specializationId = "Specialization is required";
  if (!form.hospitalId) errors.hospitalId = "Hospital is required";
  if (!form.experienceYears) errors.experienceYears = "Experience is required";
  if (!form.consultationFee)
    errors.consultationFee = "Consultation fee is required";
  return errors;
};

export const filterDoctors = (doctors: Doctor[], f: DoctorFilter): Doctor[] =>
  doctors.filter((d) => {
    const q = f.search.toLowerCase();

    if (
      f.search &&
      !(
        d.name.toLowerCase().includes(q) ||
        d.specialization.name.toLowerCase().includes(q) ||
        d.hospital.name.toLowerCase().includes(q)
      )
    )
      return false;

    if (f.specialty && d.specialization._id !== f.specialty) return false;

    if (f.hospital && d.hospital._id !== f.hospital) return false;

    if (f.day && !d.availability.some((a) => a.day === f.day)) return false;

    if (f.experience) {
      const [min, max] = f.experience.split("-").map(Number);
      if (
        max
          ? d.experienceYears < min || d.experienceYears > max
          : d.experienceYears < min
      )
        return false;
    }

    if (f.minFees && !d.isFree && d.consultationFee < parseFloat(f.minFees))
      return false;
    if (f.maxFees && !d.isFree && d.consultationFee > parseFloat(f.maxFees))
      return false;

    if (
      f.status !== "all" &&
      (f.status === "active" ? !d.isActive : d.isActive)
    )
      return false;

    return true;
  });

export const getDoctorSummary = (doctors: Doctor[]) => ({
  total: doctors.length,
  active: doctors.filter((d) => d.isActive).length,
  inactive: doctors.filter((d) => !d.isActive).length,
  avgRating: doctors.length
    ? (doctors.reduce((s, d) => s + d.rating, 0) / doctors.length).toFixed(1)
    : "0.0",
});

export const generateSlots = (
  startHour: number = 9,
  endHour: number = 21,
): string[] => {
  const slots: string[] = [];

  for (let h = startHour; h < endHour; h++) {
    for (const m of [0, 30]) {
      const startH = h;
      const startM = m;
      const endH = m === 30 ? h + 1 : h;
      const endM = m === 30 ? 0 : 30;

      const fmt = (hour: number, min: number): string => {
        const period = hour < 12 ? "AM" : "PM";
        const h12 = hour % 12 === 0 ? 12 : hour % 12;
        const mm = min === 0 ? "00" : "30";
        return `${h12}:${mm}${period}`;
      };

      slots.push(`${fmt(startH, startM)}-${fmt(endH, endM)}`);
    }
  }

  return slots;
};

// Pre-grouped by session — ready to render
export const SLOT_SESSIONS = [
  {
    label: "Morning",
    icon: "🌅",
    color: "text-orange-500",
    bg: "bg-orange-50",
    border: "border-orange-200",
    slots: generateSlots(9, 12), // 9:00AM – 12:00PM
  },
  {
    label: "Afternoon",
    icon: "☀️",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    slots: generateSlots(12, 17), // 12:00PM – 5:00PM
  },
  {
    label: "Evening",
    icon: "🌆",
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-200",
    slots: generateSlots(17, 21), // 5:00PM – 9:00PM
  },
];
