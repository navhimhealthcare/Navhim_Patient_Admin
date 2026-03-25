import { Route, Routes } from "react-router-dom";

import AppointmentsPage from "../features/appointments/pages/appointmentsPage";
import AuthGuard from "../components/Guards/AuthGuard";
import CategoryPage from "../features/categories/pages/categoryPage";
import CommunityPage from "../features/community/pages/communityPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import DoctorsPage from "../features/doctors/pages/DoctorsPage";
import GuestGuard from "../components/Guards/GuestGuard";
import HospitalPage from "../features/hospital/page/hospitalPage";
import LandingPage from "../features/landing/pages/LandingPage";
import LoginPage from "../features/auth/pages/LoginPage";
import MainLayout from "../components/Layout/MainLayout";
import PatientsPage from "../features/patients/pages/PatientsPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import AboutUsPage from "../features/info/pages/AboutUsPage";
import WhyNavhim from "../features/info/pages/WhyNavhim";
import PrivacyPolicyPage from "../features/info/pages/PrivacyPolicyPage";
import SupportPage from "../features/info/pages/SupportPage";
import TermsAndConditionsPage from "../features/info/pages/TermsAndConditionsPage";
import ProfilePage from "../features/profile/pages/ProfilePage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";
import ComingSoon from "../components/ComingSoon/ComingSoon";
import { Navigate } from "react-router-dom";
import ChangePasswordPage from "../features/auth/pages/ChangePasswordPage";
import ActivityLogPage from "../features/activityLog/pages/ActivityLogPage";
import { ProfileProvider } from "../components/Providers/ProfileProvider";
import PatientReportPage from "../features/reports/pages/PatientReportPage";
import NavhimLabReportGenerator from "../features/reports/pages/NavhimLabReportGenerator";
import PrescriptionListPage from "../features/prescription/pages/PrescriptionListPage";
import CreatePrescriptionPage from "../features/prescription/pages/CreatePrescriptionPage";

export default function AppRoutes({ sidebarCollapsed, toggleSidebar }: any) {
  return (
    <Routes>
      {/* ── Public routes (Guest Only) ── */}
      <Route element={<GuestGuard />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* ── App routes with sidebar layout (Protected) ── */}
      <Route
        path="/app"
        element={
          <AuthGuard>
            <ProfileProvider>
              <MainLayout
                sidebarCollapsed={sidebarCollapsed}
                toggleSidebar={toggleSidebar}
              />
            </ProfileProvider>
          </AuthGuard>
        }
      >
        <Route index element={<ComingSoon />} />
        <Route path="dashboard" element={<ComingSoon />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route
          path="/app/patients/:patientId/reports"
          element={<PatientReportPage />}
        />
        <Route
          path="/app/patients/:patientId/create-report"
          element={<NavhimLabReportGenerator />}
        />
        <Route path="doctors" element={<DoctorsPage />} />
        <Route path="hospital" element={<HospitalPage />} />
        <Route path="categories" element={<CategoryPage />} />
        <Route path="community" element={<CommunityPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="change-password" element={<ChangePasswordPage />} />
        <Route path="activity-logs" element={<ActivityLogPage />} />
        <Route
          path="/app/patients/:patientId/prescriptions"
          element={<PrescriptionListPage />}
        />
        <Route
          path="/app/patients/:patientId/prescriptions/create"
          element={<CreatePrescriptionPage />}
        />

        {/* Info Pages */}
        <Route path="privacy" element={<PrivacyPolicyPage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="terms" element={<TermsAndConditionsPage />} />
        <Route path="why-navhim" element={<WhyNavhim />} />
        <Route path="aboutUs" element={<AboutUsPage />} />

        {/* Unimplemented Features */}
        <Route path="pharmacy" element={<ComingSoon />} />
        <Route path="reports" element={<ComingSoon />} />
        <Route path="notifications" element={<ComingSoon />} />
        <Route path="settings" element={<ComingSoon />} />
      </Route>

      {/* ── Catch-all redirect ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
