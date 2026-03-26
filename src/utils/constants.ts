/// <reference types="vite/client" />
const reportIcon = "/src/assets/images/report.png";
const doctorIcon = "/src/assets/images/doctor.png";
const pharmacyIcon = "/src/assets/images/pharmacy.png";
const appointmentsIcon = "/src/assets/images/appointments.png";
const dashboardIcon = "/src/assets/images/dashboard.png";
const patientsIcon = "/src/assets/images/patient.png";
const notificationIcon = "/src/assets/images/notification.png";
const settingIcon = "/src/assets/images/setting.png";
const activityLogIcon = "/src/assets/images/activityLog.png";
const hospitalIcon = "/src/assets/images/hospital.png";
const categoryIcon = "/src/assets/images/category.png";
const communityPostIcon = "/src/assets/images/communityPost.png";
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
