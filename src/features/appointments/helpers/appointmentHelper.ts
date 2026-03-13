import {
  Appointment,
  AppointmentFilter,
  AppointmentStatus,
  PaymentStatus,
} from "../types/appointment.types";

export const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    bg: string;
    text: string;
    dot: string;
    border: string;
  }
> = {
  booked: {
    label: "Booked",
    bg: "bg-blue-50",
    text: "text-blue-600",
    dot: "bg-blue-500",
    border: "border-blue-200",
  },
  completed: {
    label: "Completed",
    bg: "bg-success-bg",
    text: "text-green-700",
    dot: "bg-green-500",
    border: "border-green-200",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-danger-bg",
    text: "text-danger",
    dot: "bg-danger",
    border: "border-red-200",
  },
  rescheduled: {
    label: "Rescheduled",
    bg: "bg-amber-50",
    text: "text-amber-600",
    dot: "bg-amber-500",
    border: "border-amber-200",
  },
};

export const PAYMENT_CONFIG: Record<
  string,
  {
    label: string;
    bg: string;
    text: string;
  }
> = {
  paid: { label: "Paid", bg: "bg-success-bg", text: "text-green-700" },
  unpaid: { label: "Unpaid", bg: "bg-amber-50", text: "text-amber-600" },
  refunded: { label: "Refunded", bg: "bg-gray-100", text: "text-gray-500" },
  not_required: {
    label: "Not Required",
    bg: "bg-gray-100",
    text: "text-gray-400",
  },
};

export const MODE_LABEL: Record<
  string,
  { label: string; icon: string; bg: string; text: string }
> = {
  Online: {
    label: "Online",
    icon: "💻",
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  Offline: {
    label: "Offline",
    icon: "🏥",
    bg: "bg-gray-50",
    text: "text-gray-600",
  },
  In_Clinic: {
    label: "In Clinic",
    icon: "🏥",
    bg: "bg-purple-50",
    text: "text-purple-600",
  },
};

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const formatDateShort = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

export const isToday = (iso: string): boolean => {
  const d = new Date(iso),
    n = new Date();
  return (
    d.getDate() === n.getDate() &&
    d.getMonth() === n.getMonth() &&
    d.getFullYear() === n.getFullYear()
  );
};

export const isFuture = (iso: string): boolean => new Date(iso) > new Date();

export const filterAppointments = (
  list: Appointment[],
  f: AppointmentFilter,
): Appointment[] =>
  list.filter((a) => {
    if (!a || !a.doctor) return false;
    if (f.search) {
      const q = f.search.toLowerCase();
      const docName = a.doctor.name?.toLowerCase() || "";
      const hospName = a.hospital?.name?.toLowerCase() || "";
      const specName =
        typeof a.doctor.specialization === "object"
          ? a.doctor.specialization.name?.toLowerCase() || ""
          : String(a.doctor.specialization || "").toLowerCase();
      const reason = a.reason?.toLowerCase() || "";
      const patientName =
        typeof a.patient === "object"
          ? a.patient?.name?.toLowerCase() || ""
          : "";
      const nfcCard =
        typeof a.patient === "object"
          ? a.patient?.nfcCardNumber?.toLowerCase() || ""
          : "";

      if (
        !(
          docName.includes(q) ||
          hospName.includes(q) ||
          specName.includes(q) ||
          reason.includes(q) ||
          patientName.includes(q) ||
          nfcCard.includes(q)
        )
      )
        return false;
    }
    if (f.status !== "all" && a.status !== f.status) return false;
    if (f.mode !== "all" && a.mode !== f.mode) return false;
    if (f.payment !== "all" && a.paymentStatus !== f.payment) return false;
    if (f.startDate && a.appointmentDate) {
      if (a.appointmentDate.slice(0, 10) < f.startDate) return false;
    }
    if (f.endDate && a.appointmentDate) {
      if (a.appointmentDate.slice(0, 10) > f.endDate) return false;
    }
    return true;
  });

export const getAppSummary = (list: Appointment[]) => {
  const safeList = list.filter((a) => !!a);
  return {
    total: safeList.length,
    booked: safeList.filter((a) => a.status === "booked").length,
    completed: safeList.filter((a) => a.status === "completed").length,
    cancelled: safeList.filter((a) => a.status === "cancelled").length,
    rescheduled: safeList.filter((a) => a.status === "rescheduled").length,
    today: safeList.filter(
      (a) => a.appointmentDate && isToday(a.appointmentDate),
    ).length,
    unpaid: safeList.filter((a) => a.paymentStatus === "unpaid").length,
  };
};

export const EMPTY_FILTER: AppointmentFilter = {
  search: "",
  status: "all",
  mode: "all",
  payment: "all",
  startDate: "",
  endDate: "",
};
