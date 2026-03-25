import { useState, useCallback, useEffect } from "react";
import {
  PatientReport,
  ReportFilter,
  CreateReportPayload,
} from "../types/report.types";
import {
  fetchPatientReportsAPI,
  createPatientReportAPI,
} from "../services/reportService";
import showToast from "../../../utils/toast";

export const EMPTY_REPORT_FILTER: ReportFilter = { fromDate: "", toDate: "" };

export const usePatientReports = (patientId: string) => {
  const [reports, setReports] = useState<PatientReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState<ReportFilter>(EMPTY_REPORT_FILTER);

  const fetchReports = useCallback(
    async (f: ReportFilter) => {
      if (!patientId) return;
      setLoading(true);
      try {
        const params: {
          patientId: string;
          fromDate?: string;
          toDate?: string;
        } = { patientId };
        if (f.fromDate) params.fromDate = f.fromDate;
        if (f.toDate) params.toDate = f.toDate;
        const res = await fetchPatientReportsAPI(params);
        setReports(res.data.data ?? []);
      } catch (err: any) {
        showToast.error(
          err?.response?.data?.message || "Failed to load reports.",
        );
      } finally {
        setLoading(false);
      }
    },
    [patientId],
  );

  useEffect(() => {
    fetchReports(filter);
  }, [patientId, filter.fromDate, filter.toDate]);

  const updateFilter = (updater: (prev: ReportFilter) => ReportFilter) =>
    setFilter((prev) => updater(prev));

  const createReport = async (
    payload: CreateReportPayload,
  ): Promise<boolean> => {
    setActionLoading(true);
    try {
      const res = await createPatientReportAPI(payload);
      // Prepend new report to list
      setReports((prev) => [res.data.data, ...prev]);
      showToast.success("Report created successfully!");
      return true;
    } catch (err: any) {
      showToast.error(
        err?.response?.data?.message || "Failed to create report.",
      );
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    reports,
    loading,
    actionLoading,
    filter,
    updateFilter,
    createReport,
    refresh: () => fetchReports(filter),
  };
};
