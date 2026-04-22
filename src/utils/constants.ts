/// <reference types="vite/client" />
import reportIcon from "../assets/images/report.png";
import doctorIcon from "../assets/images/doctor.png"
import pharmacyIcon from "../assets/images/pharmacy.png";
import appointmentsIcon from "../assets/images/appointments.png";
import dashboardIcon from "../assets/images/dashboard.png";
import patientsIcon from "../assets/images/patient.png";
import notificationIcon from "../assets/images/notification.png";
import settingIcon from "../assets/images/setting.png";
import activityLogIcon from "../assets/images/activityLog.png";
import hospitalIcon from "../assets/images/hospital.png";
import categoryIcon from "../assets/images/category.png";
import communityPostIcon from "../assets/images/communityPost.png";
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
        // badge: 12,
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
      {
        label: "Category",
        icon: categoryIcon,
        iconFilter: "brand",
        path: "/app/categories",
      },
      {
        label: "Community",
        icon: communityPostIcon,
        iconFilter: "brand",
        path: "/app/community",
      },
    ],
  },
  // {
  //   section: "Reports",
  //   items: [
  //     { label: "Reports", icon: reportIcon, path: "/app/reports" },
  //     {
  //       label: "Notifications",
  //       icon: notificationIcon,
  //       iconFilter: "brand",
  //       path: "/app/notifications",
  //       badge: 5,
  //       badgeColor: "red",
  //     },
  //   ],
  // },
  {
    section: "About Navhim",
    items: [
      {
        label: "About Navhim",
        icon: "ℹ️",
        path: "#",
        subItems: [
          { label: "Privacy & Policy", path: "/app/privacy" },
          { label: "Support", path: "/app/support" },
          { label: "Terms & Conditions", path: "/app/terms" },
          { label: "Why Navhim", path: "/app/why-navhim" },
          { label: "About Us", path: "/app/aboutUs" },
        ],
      },
    ],
  },
  // {
  //   section: "System",
  //   items: [{ label: "Settings", icon: settingIcon, path: "/app/settings" }],
  // },
  {
    section: "Activity Log",
    items: [
      {
        label: "Activity Log",
        icon: activityLogIcon,
        iconFilter: "brand",
        path: "/app/activity-logs",
      },
    ],
  },
];

export const STATUS = {
  ACTIVE: "active",
  PENDING: "pending",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

// ── API base ────────────────────────────────────────────────────────
export const API_BASE_URL = import.meta.env.VITE_API_URL;
export const GCP_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
// ── Pagination ──────────────────────────────────────────────────────
export const PAGE_SIZE = 10;

export const LOCAL_DATA_STORE = {
  JWT_TOKEN: "jwt_token",
  USER_DATA: "user_data",
};

export const QUICK_ACTIONS = [
  { image: "👤", name: "Patient", bg: "bg-success-bg", path: "/app/patients" },
  { image: "🧾", name: "Doctor", bg: "bg-warning-bg", path: "/app/doctors" },
  {
    image: "💊",
    name: "Prescribe",
    bg: "bg-brand-lighter",
    path: "/app/patients",
  },
  {
    image: "👥",
    name: "Community",
    bg: "bg-success-bg",
    path: "/app/community",
  },
  { image: "🏷", name: "Category", bg: "bg-surface", path: "/app/categories" },
];
