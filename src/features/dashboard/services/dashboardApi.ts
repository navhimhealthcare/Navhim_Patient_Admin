import axiosInstance from "../../../services/axiosConfig";
import {
  DashboardCountsResponse,
  DashboardAppOverviewResponse,
  DashboardRecentResponse,
  DashboardTopDoctorsResponse,
  DashboardDepartmentLoadResponse,
} from "../types/dashboard.types";

export const dashboardService = {
  getDashboardCounts: () =>
    axiosInstance.get<DashboardCountsResponse>("/dashboard/counts"),
  getDashboardAppOverview: (year: number) =>
    axiosInstance.get<DashboardAppOverviewResponse>(
      `/dashboard/appointments/overview?year=${year}`,
    ),
  getDashboardAppRecent: () =>
    axiosInstance.get<DashboardRecentResponse>(
      "/dashboard/appointments/recent",
    ),
  getDashboardTopDoctors: () =>
    axiosInstance.get<DashboardTopDoctorsResponse>("/dashboard/top-doctors"),
  getDashboardDepartmentsLoad: () =>
    axiosInstance.get<DashboardDepartmentLoadResponse>("/dashboard/departments-load"),
};
