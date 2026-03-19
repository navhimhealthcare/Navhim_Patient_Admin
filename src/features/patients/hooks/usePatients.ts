import { useState, useEffect, useCallback, useRef } from "react";
import {
  Patient,
  PatientFormValues,
  PatientFormAddValues,
} from "../types/patient.types";
import { patientService } from "../services/patientService";
import {
  buildAddPatientPayload,
  buildUpdatePatientPayload,
  isOnlyStatusChanged,
} from "../helpers/patientHelper";
import showToast from "../../../utils/toast";

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const isFetching = useRef(false);

  const fetchAll = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    try {
      const res = await patientService.getAll();
      setPatients(res.data.data);
    } catch (err: any) {
      showToast.error(
        err?.response?.data?.message || "Failed to load patients.",
      );
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Add — only 5 fields via JSON ────────────────────────────────
  const addPatient = async (form: PatientFormAddValues): Promise<boolean> => {
    setActionLoading(true);
    try {
      const res = await patientService.create(buildAddPatientPayload(form));
      setPatients((p) => [res.data.data, ...p]);
      showToast.success(`${form.name} registered successfully!`);
      fetchAll();
      return true;
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || "Failed to add patient.");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // ── Edit — full FormData with id in query param ──────────────────
  const editPatient = async (
    id: string,
    form: PatientFormValues,
  ): Promise<boolean> => {
    setActionLoading(true);
    try {
      const res = await patientService.update(
        id,
        buildUpdatePatientPayload(form),
      );
      if (res.data?.data?._id) {
        setPatients((p) => p.map((pt) => (pt._id === id ? res.data.data : pt)));
      } else {
        await fetchAll();
      }

      const original = patients.find((p) => p._id === id);
      if (original && isOnlyStatusChanged(form, original)) {
        showToast.success(
          `Patient account ${form.isActive ? "activated" : "deactivated"}!`,
        );
      } else {
        showToast.success(`${form.name} updated successfully!`);
      }
      return true;
    } catch (err: any) {
      showToast.error(
        err?.response?.data?.message || "Failed to update patient.",
      );
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const removePatient = async (patient: Patient): Promise<boolean> => {
    setActionLoading(true);
    try {
      await patientService.remove(patient._id);
      setPatients((p) => p.filter((pt) => pt._id !== patient._id));
      showToast.warn(`${patient.name} removed.`);
      return true;
    } catch (err: any) {
      showToast.error(
        err?.response?.data?.message || "Failed to remove patient.",
      );
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    patients,
    loading,
    actionLoading,
    fetchAll,
    addPatient,
    editPatient,
    removePatient,
  };
};
