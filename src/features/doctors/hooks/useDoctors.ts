import { useState, useEffect, useCallback, useRef } from "react";
import { Category, Doctor, DoctorFormValues } from "../types/doctor.types";
import { doctorService } from "../services/doctorService";
import { buildDoctorPayload } from "../helpers/doctorHelper";
import showToast from "../../../utils/toast";

export const useDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const isFetching = useRef(false);
  const isFetchingCategories = useRef(false);

  const fetchAll = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    try {
      const res = await doctorService.getAll();
      setDoctors(res.data.data);
    } catch (err: any) {
      showToast.error(
        err?.response?.data?.message || "Failed to load doctors.",
      );
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  const fetchCategoriesAll = useCallback(async () => {
    if (isFetchingCategories.current) return;
    isFetchingCategories.current = true;
    setLoading(true);
    try {
      const res = await doctorService.getCategoryAll();
      setCategories(res.data.data);
    } catch (err: any) {
      showToast.error(
        err?.response?.data?.message || "Failed to load doctors.",
      );
    } finally {
      setLoading(false);
      isFetchingCategories.current = false;
    }
  }, []);

  useEffect(() => {
    fetchAll();
    fetchCategoriesAll();
  }, [fetchAll, fetchCategoriesAll]);

  const addDoctor = async (form: DoctorFormValues): Promise<boolean> => {
    setActionLoading(true);
    try {
      const res = await doctorService.create(buildDoctorPayload(form));
      fetchAll();
      // setDoctors((p) => [res.data.data, ...p]);
      showToast.success(`Dr. ${form.name} added successfully!`);
      return true;
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || "Failed to add doctor.");
      return false;
    } finally {
      setActionLoading(false);
    }
  };
  const editDoctor = async (
    id: string,
    form: DoctorFormValues,
  ): Promise<boolean> => {
    setActionLoading(true);
    try {
      // Pass raw form — service decides FormData vs JSON based on profileImage
      const res = await doctorService.update(id, form);
      fetchAll();
      // setDoctors((p) => p.map((d) => (d._id === id ? res.data.data : d)));
      showToast.success(`Dr. ${form.name} updated successfully!`);
      return true;
    } catch (err: any) {
      showToast.error(
        err?.response?.data?.message || "Failed to update doctor.",
      );
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const removeDoctor = async (doctor: Doctor): Promise<boolean> => {
    setActionLoading(true);
    try {
      await doctorService.remove(doctor._id);
      fetchAll();
      // setDoctors((p) => p.filter((d) => d._id !== doctor._id));
      showToast.warn(`${doctor.name} removed from roster.`);
      return true;
    } catch (err: any) {
      showToast.error(
        err?.response?.data?.message || "Failed to remove doctor.",
      );
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const toggleStatus = async (doctor: Doctor): Promise<void> => {
    try {
      await doctorService.toggleStatus(doctor._id, !doctor.isActive);
      setDoctors((p) =>
        p.map((d) =>
          d._id === doctor._id ? { ...d, isActive: !d.isActive } : d,
        ),
      );
      showToast.info(
        `${doctor.name} marked ${doctor.isActive ? "Inactive" : "Active"}.`,
      );
    } catch (err: any) {
      showToast.error(
        err?.response?.data?.message || "Failed to update status.",
      );
    }
  };

  return {
    doctors,
    categories,
    loading,
    actionLoading,
    fetchAll,
    fetchCategoriesAll,
    addDoctor,
    editDoctor,
    removeDoctor,
    toggleStatus,
  };
};
