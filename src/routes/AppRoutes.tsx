import { Route, Routes } from "react-router-dom";

import AppointmentsPage from "../features/appointments/pages/AppointmentsPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import DoctorsPage from "../features/doctors/pages/DoctorsPage";
import LandingPage from "../features/landing/pages/LandingPage";
import LoginPage from "../features/auth/pages/LoginPage";
import MainLayout from "../components/Layout/MainLayout";
import PatientsPage from "../features/patients/pages/PatientsPage";
import AuthGuard from "../components/Guards/AuthGuard";
import GuestGuard from "../components/Guards/GuestGuard";
import HospitalPage from "../features/hospital/page/hospitalPage";
import CategoryPage from '../features/categories/pages/categoryPage'

export default function AppRoutes({ sidebarCollapsed, toggleSidebar }: any) {
  return (
    <Routes>
      {/* ── Public routes (Guest Only) ── */}
      <Route element={<GuestGuard />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* ── App routes with sidebar layout (Protected) ── */}
      <Route
        path="/app"
        element={
          <AuthGuard>
            <MainLayout
              sidebarCollapsed={sidebarCollapsed}
              toggleSidebar={toggleSidebar}
            />
          </AuthGuard>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="doctors" element={<DoctorsPage />} />
        <Route path="hospital" element={<HospitalPage />} />
        <Route path="categories" element={<CategoryPage />} />
      </Route>
    </Routes>
  );
}
