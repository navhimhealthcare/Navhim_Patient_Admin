import { useState, useEffect, useCallback, useRef } from "react";
import { dashboardService } from "../services/dashboardApi";
import {
  DashboardCounts,
  AppointmentOverviewMonth,
  RecentAppointment,
  TopDoctor,
  DepartmentLoad,
} from "../types/dashboard.types";
import showToast from "../../../utils/toast";

// ── useDashboardCounts ──────────────────────────────────────────────────────
export const useDashboardCounts = () => {
  const [counts, setCounts] = useState<DashboardCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const isFetching = useRef(false);

  const fetchCounts = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    try {
      const res = await dashboardService.getDashboardCounts();
      setCounts(res.data.data);
    } catch (err: any) {
      showToast.error(
        err?.response?.data?.message || "Failed to load dashboard counts.",
      );
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  return { counts, loading, refetch: fetchCounts };
};

// ── useDashboardAppOverview ─────────────────────────────────────────────────
export const useDashboardAppOverview = (year: number) => {
  const [overviewData, setOverviewData] = useState<AppointmentOverviewMonth[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getDashboardAppOverview(year);
      setOverviewData(res.data.data);
    } catch (err: any) {
      showToast.error(
        err?.response?.data?.message || "Failed to load appointment overview.",
      );
      setOverviewData([]);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return { overviewData, loading, refetch: fetchOverview };
};

// ── useDashboardAppRecent ───────────────────────────────────────────────────
export const useDashboardAppRecent = () => {
  const [recentAppointments, setRecentAppointments] = useState<
    RecentAppointment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const isFetching = useRef(false);

  const fetchRecent = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    try {
      const res = await dashboardService.getDashboardAppRecent();
      setRecentAppointments(res.data.data);
    } catch (err: any) {
      showToast.error(
        err?.response?.data?.message || "Failed to load recent appointments.",
      );
      setRecentAppointments([]);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  return { recentAppointments, loading, refetch: fetchRecent };
};

// get Top Doctors
export const useDashboardTopDoctors = () => {
  const [topDoctors, setTopDoctors] = useState<TopDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const isFetching = useRef(false);

  const fetchTopDoctors = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    try {
      const res = await dashboardService.getDashboardTopDoctors();
      setTopDoctors(res.data.data);
    } catch (err: any) {
      showToast.error(
        err?.response?.data?.message || "Failed to load top doctors.",
      );
      setTopDoctors([]);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    fetchTopDoctors();
  }, [fetchTopDoctors]);

  return { topDoctors, loading, refetch: fetchTopDoctors };
};

export const useDashboardDepartmentsLoad = () => {
  const [departmentsLoad, setDepartmentsLoad] = useState<DepartmentLoad[]>([]);
  const [loading, setLoading] = useState(true);
  const isFetching = useRef(false);

  const fetchDepartmentsLoad = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    try {
      const res = await dashboardService.getDashboardDepartmentsLoad();
      setDepartmentsLoad(res.data.data);
    } catch (err: any) {
      showToast.error(
        err?.response?.data?.message || "Failed to load department loads.",
      );
      setDepartmentsLoad([]);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    fetchDepartmentsLoad();
  }, [fetchDepartmentsLoad]);

  return { departmentsLoad, loading, refetch: fetchDepartmentsLoad };
};
