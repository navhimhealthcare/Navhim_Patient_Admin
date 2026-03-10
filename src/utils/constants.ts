/// <reference types="vite/client" />
const reportIcon = "/src/assets/images/report.png";
const doctorIcon = "/src/assets/images/doctor.png";
const pharmacyIcon = "/src/assets/images/pharmacy.png";
const appointmentsIcon = "/src/assets/images/appointments.png";
const dashboardIcon = "/src/assets/images/dashboard.png";
const patientsIcon = "/src/assets/images/patient.png";
const notificationIcon = "/src/assets/images/notification.png";
const settingIcon = "/src/assets/images/setting.png";
const hospitalIcon = "/src/assets/images/hospital.png";

export const NAV_ITEMS = [
  {
    section: "Main Menu",
    items: [
      { label: "Dashboard", icon: dashboardIcon, path: "/app/dashboard" },
      {
        label: "Appointments",
        icon: appointmentsIcon,
        iconFilter: "brand",
        path: "/app/appointments",
        badge: 12,
        badgeColor: "blue",
      },
      {
        label: "Patients",
        icon: patientsIcon,
        iconFilter: "brand",
        path: "/app/patients",
      },
      { label: "Doctors", icon: doctorIcon, path: "/app/doctors" },
      {
        label: "Pharmacy",
        icon: pharmacyIcon,
        path: "/app/pharmacy",
        badge: 3,
        badgeColor: "yellow",
      },
      { label: "Hospital", icon: hospitalIcon, path: "/app/hospital" },
      { label: "Category", icon: hospitalIcon, path: "/app/categories" },
    ],
  },
  {
    section: "Reports",
    items: [
      // { label: 'Analytics',     icon: reportIcon, path: '/app/analytics' },
      { label: "Reports", icon: reportIcon, path: "/app/reports" },
      {
        label: "Notifications",
        icon: notificationIcon,
        iconFilter: "brand",
        path: "/app/notifications",
        badge: 5,
        badgeColor: "red",
      },
    ],
  },
  {
    section: "System",
    items: [
      { label: "Settings", icon: settingIcon, path: "/app/settings" },
      // { label: 'Permissions', icon: reportIcon, path: '/app/permissions' },
    ],
  },
];

// ── Status options ──────────────────────────────────────────────────
export const STATUS = {
  ACTIVE: "active",
  PENDING: "pending",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

// ── API base ────────────────────────────────────────────────────────
export const API_BASE_URL = import.meta.env.VITE_API_URL;
// ── Pagination ──────────────────────────────────────────────────────
export const PAGE_SIZE = 10;

export const LOCAL_DATA_STORE = {
  JWT_TOKEN: "jwt_token",
  USER_DATA: "user_data",
};
