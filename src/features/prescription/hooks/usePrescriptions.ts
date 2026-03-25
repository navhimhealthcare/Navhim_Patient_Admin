import { useState, useEffect, useCallback } from "react";
import { Prescription, PrescriptionFilter } from "../types/prescription.types";
import { prescriptionService } from "../services/prescriptionService";
import showToast from "../../../utils/toast";

export const EMPTY_FILTER: PrescriptionFilter = {
  fromDate: "",
  toDate: "",
  status: "all",
};

export const usePrescriptions = (patientId: string) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PrescriptionFilter>(EMPTY_FILTER);

  const fetchPrescriptions = useCallback(
    async (f: PrescriptionFilter) => {
      setLoading(true);
      try {
        const params: {
          patientId?: string;
          fromDate?: string;
          toDate?: string;
        } = {};
        if (patientId) params.patientId = patientId;
        if (f.fromDate) params.fromDate = f.fromDate;
        if (f.toDate) params.toDate = f.toDate;
        const res = await prescriptionService.getByPatient(params);
        setPrescriptions(res.data.data ?? []);
      } catch (err: any) {
        setPrescriptions([]);
        showToast.error(
          err?.response?.data?.message ,
        );
      } finally {
        setLoading(false);
      }
    },
    [patientId],
  );

  useEffect(() => {
    fetchPrescriptions(filter);
  }, [patientId, filter.fromDate, filter.toDate]);

  const updateFilter = (
    updater: (prev: PrescriptionFilter) => PrescriptionFilter,
  ) => setFilter((prev) => updater(prev));

  // Client-side status filter
  const filtered =
    filter.status === "all"
      ? prescriptions
      : prescriptions.filter((p) => p.status === filter.status);

  return {
    prescriptions: filtered,
    allPrescriptions: prescriptions,
    loading,
    filter,
    updateFilter,
    refresh: () => fetchPrescriptions(filter),
  };
};
