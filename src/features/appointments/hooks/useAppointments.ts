import { useState, useEffect, useCallback, useRef } from "react";
import {
  Appointment,
  AppointmentCreateForm,
  AppointmentFilter,
  AppointmentRescheduleForm,
  PaginationMeta,
} from "../types/appointment.types";
import { appointmentService } from "../services/appointmentService";
import showToast from "../../../utils/toast";

const DEFAULT_LIMIT = 10;

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: DEFAULT_LIMIT,
    totalPages: 1,
  });
  const isFetching = useRef(false);

  const fetchAll = useCallback(
    async (
      page = 1,
      limit = DEFAULT_LIMIT,
      filters: Partial<AppointmentFilter> = {},
    ) => {
      if (isFetching.current) return;
      isFetching.current = true;
      setLoading(true);

      try {
        const params: any = {
          page: Number(page) || 1,
          limit: Number(limit) || DEFAULT_LIMIT,
          ...filters,
        };

        // Clean empty/all filters
        Object.keys(params).forEach((key) => {
          if (["page", "limit"].includes(key)) return;
          if (
            params[key] === "" ||
            params[key] === "all" ||
            params[key] === undefined
          ) {
            delete params[key];
          }
        });

        const res = await appointmentService.getAll(params);
        const body = res.data;

        const appointmentsList = Array.isArray(body.data)
          ? body.data
          : Array.isArray(body)
            ? body
            : [];
        setAppointments(appointmentsList);

        // Metadata extraction (following useDoctors pattern)
        const searchMeta = [
          body.pagination,
          (body as any).meta,
          (body as any).paging,
          (body.data as any)?.pagination,
          (body.data as any)?.meta,
          res.headers,
        ].filter(Boolean);

        let totalVal = 0;
        let limitVal = Number(limit) || DEFAULT_LIMIT;
        let pageVal = Number(page) || 1;
        let pagesVal = 1;

        for (const m of searchMeta) {
          const t =
            m.total ??
            m.totalDocs ??
            m.totalCount ??
            m.count ??
            m.total_records;
          if (typeof t === "number") {
            totalVal = t;
            break;
          }
        }
        if (totalVal === 0) totalVal = appointmentsList.length;

        for (const m of searchMeta) {
          const l = m.limit ?? m.pageSize ?? m.perPage ?? m.size;
          if (typeof l === "number") {
            limitVal = l;
            break;
          }
        }

        for (const m of searchMeta) {
          const p = m.page ?? m.currentPage ?? m.current ?? m.pageNo;
          if (typeof p === "number") {
            pageVal = p;
            break;
          }
        }

        for (const m of searchMeta) {
          const ps = m.totalPages ?? m.pages ?? m.pageCount;
          if (typeof ps === "number" && ps > 0) {
            pagesVal = ps;
            break;
          }
        }

        // Fallback logic
        if (appointmentsList.length >= limitVal) {
          if (pagesVal <= pageVal) {
            pagesVal = pageVal + 1;
          }
        } else {
          pagesVal = pageVal;
        }

        setPagination({
          total: totalVal,
          page: pageVal,
          limit: limitVal,
          totalPages: pagesVal || 1,
        });
      } catch (err: any) {
        showToast.error(
          err?.response?.data?.message || "Failed to load appointments.",
        );
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    },
    [],
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const bookAppointment = async (
    form: AppointmentCreateForm,
  ): Promise<boolean> => {
    setActionLoading(true);
    try {
      const { patientId, ...rest } = form;
      await appointmentService.create(patientId, rest);
      await fetchAll(pagination.page, pagination.limit);
      showToast.success("Appointment scheduled!");
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
      await appointmentService.reschedule(id, form);
      await fetchAll(pagination.page, pagination.limit);
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
    pagination,
    fetchAll,
    bookAppointment,
    rescheduleAppointment,
    cancelAppointment,
    markCompleted,
  };
};
