import { useState, useEffect, useCallback } from "react";
import {
  Appointment,
  AppointmentCreateForm,
  AppointmentRescheduleForm,
} from "../types/appointment.types";
import { appointmentService } from "../services/appointmentService";
import showToast from "../../../utils/toast";

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getAll();
      setAppointments(res.data.data);
    } catch (err: any) {
      showToast.error(
        err?.response?.data?.message || "Failed to load appointments.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const bookAppointment = async (
    form: AppointmentCreateForm,
  ): Promise<boolean> => {
    setActionLoading(true);
    try {
      const { patientId, ...rest } = form;
      const res = await appointmentService.create(patientId, rest);
      await fetchAll();
      showToast.success("Appointment booked!");
      return true;
    } catch (err: any) {
      showToast.error(
        err?.response?.data?.message || "Failed to book appointment.",
      );
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const rescheduleAppointment = async (
    id: string,
    form: AppointmentRescheduleForm,
  ): Promise<boolean> => {
    setActionLoading(true);
    try {
      const res = await appointmentService.reschedule(id, form);
      await fetchAll();
      showToast.success("Appointment rescheduled!");
      return true;
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || "Failed to reschedule.");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const cancelAppointment = async (appt: Appointment): Promise<boolean> => {
    setActionLoading(true);
    try {
      await appointmentService.updateStatus(appt._id, "cancelled");
      setAppointments((p) =>
        p.map((a) => (a._id === appt._id ? { ...a, status: "cancelled" } : a)),
      );
      showToast.warn("Appointment cancelled.");
      return true;
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || "Failed to cancel.");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const markCompleted = async (id: string): Promise<void> => {
    try {
      await appointmentService.updateStatus(id, "completed");
      setAppointments((p) =>
        p.map((a) => (a._id === id ? { ...a, status: "completed" } : a)),
      );
      showToast.success("Marked as completed.");
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || "Failed.");
    }
  };

  return {
    appointments,
    loading,
    actionLoading,
    fetchAll,
    bookAppointment,
    rescheduleAppointment,
    cancelAppointment,
    markCompleted,
  };
};
