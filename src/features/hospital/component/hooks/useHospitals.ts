import { useState, useEffect, useCallback } from "react";
import {
  Hospital,
  HospitalFormValues,
} from "../../component/types/hospital.types";
import { hospitalService } from "../hospitalService";
import { buildHospitalPayload } from "../hospitalHelpers";
import showToast from "../../../../utils/toast";

export const useHospitals = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  /* ── Fetch ── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await hospitalService.getAll();
      setHospitals(res.data.data);
    } catch (err: any) {
      showToast.error(
        err?.response?.data?.message || "Failed to load hospitals.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /* ── Add ── */
  const addHospital = async (form: HospitalFormValues): Promise<boolean> => {
    setActionLoading(true);
    try {
      const res = await hospitalService.create(buildHospitalPayload(form));
      setHospitals((prev) => [res.data.data, ...prev]);
      showToast.success(`"${form.name}" added successfully!`);
      return true;
    } catch (err: any) {
      showToast.error(
        err?.response?.data?.message || "Failed to add hospital.",
      );
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Edit ── */
  const editHospital = async (
    id: string,
    form: HospitalFormValues,
  ): Promise<boolean> => {
    setActionLoading(true);
    try {
      const res = await hospitalService.update(id, buildHospitalPayload(form));
      setHospitals((prev) =>
        prev.map((h) => (h._id === id ? res.data.data : h)),
      );
      showToast.success(`"${form.name}" updated successfully!`);
      return true;
    } catch (err: any) {
      showToast.error(
        err?.response?.data?.message || "Failed to update hospital.",
      );
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Delete ── */
  const removeHospital = async (hospital: Hospital): Promise<boolean> => {
    setActionLoading(true);
    try {
      await hospitalService.remove(hospital._id);
      setHospitals((prev) => prev.filter((h) => h._id !== hospital._id));
      showToast.error(`"${hospital.name}" has been deleted.`);
      return true;
    } catch (err: any) {
      showToast.error(
        err?.response?.data?.message || "Failed to delete hospital.",
      );
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Toggle status ── */
  const toggleStatus = async (hospital: Hospital): Promise<void> => {
    try {
      await hospitalService.toggleStatus(hospital._id, !hospital.isActive);
      setHospitals((prev) =>
        prev.map((h) =>
          h._id === hospital._id ? { ...h, isActive: !h.isActive } : h,
        ),
      );
      showToast.info(
        `"${hospital.name}" marked as ${hospital.isActive ? "Inactive" : "Active"}.`,
      );
    } catch (err: any) {
      showToast.error(
        err?.response?.data?.message || "Failed to update status.",
      );
    }
  };

  return {
    hospitals,
    loading,
    actionLoading,
    fetchAll,
    addHospital,
    editHospital,
    removeHospital,
    toggleStatus,
  };
};
