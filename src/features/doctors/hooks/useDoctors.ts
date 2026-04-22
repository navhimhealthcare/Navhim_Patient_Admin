import { useState, useCallback, useRef } from "react";
import { Category, Doctor, DoctorFilter, DoctorFormValues, PaginationMeta } from "../types/doctor.types";
import { doctorService } from "../services/doctorService";
import { formFromDoctor } from "../helpers/doctorHelper";
import showToast from "../../../utils/toast";

const DEFAULT_LIMIT = 10;

export const useDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [counts, setCounts] = useState<{
    total: number;
    active: number;
    inactive: number;
  }>({ total: 0, active: 0, inactive: 0 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const isFetching = useRef(false);

  const fetchAll = useCallback(
    async (page = 1, limit = 10, filters: Partial<DoctorFilter> = {}) => {
      if (isFetching.current) return;
      isFetching.current = true;
      setLoading(true);

      try {
        const params: any = {
          page: Number(page) || 1,
          limit: Number(limit) || 10,
          ...filters,
        };

        if (filters.status === "active") params.isActive = true;
        else if (filters.status === "inactive") params.isActive = false;
        delete params.status;

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

        const res = await doctorService.getAll(params);
        const body = res.data;

        // Populate doctors list from new structure: body.data.data
        const doctorsList = Array.isArray(body.data?.data)
          ? body.data.data
          : Array.isArray(body.data)
          ? body.data
          : Array.isArray(body)
          ? body
          : [];

        setDoctors(doctorsList);

        if (body.data?.counts) {
          setCounts(body.data.counts);
        }

        // Aggressive metadata extraction
        const searchMeta = [
          body,
          body.pagination,
          (body as any).meta,
          (body as any).paging,
          (body.data as any)?.pagination,
          (body.data as any)?.meta,
          res.headers,
        ].filter(Boolean);

        let totalVal = body.data?.counts?.total ?? 0;
        let limitVal = Number(limit) || 10;
        let pageVal = Number(page) || 1;
        let pagesVal = 1;

        for (const m of searchMeta) {
          const t =
            m.total ??
            m.totalDocs ??
            m.total_docs ??
            m.totalCount ??
            m.total_count ??
            m.count ??
            m.total_records;
          if (typeof t === "number") {
            totalVal = t;
            break;
          }
        }
        if (totalVal === 0) totalVal = doctorsList.length;

        for (const m of searchMeta) {
          const l = m.limit ?? m.pageSize ?? m.perPage ?? m.per_page ?? m.size;
          if (typeof l === "number") {
            limitVal = l;
            break;
          }
        }
        for (const m of searchMeta) {
          const p =
            m.page ?? m.currentPage ?? m.current_page ?? m.current ?? m.pageNo;
          if (typeof p === "number") {
            pageVal = p;
            break;
          }
        }
        for (const m of searchMeta) {
          const ps =
            m.totalPages ??
            m.pages ??
            m.total_pages ??
            m.pageCount ??
            m.total_pages_count;
          if (typeof ps === "number" && ps > 0) {
            pagesVal = ps;
            break;
          }
        }

        // Smart Fallback
        if (doctorsList.length >= limitVal) {
          if (pagesVal <= pageVal) pagesVal = pageVal + 1;
        } else {
          pagesVal = pageVal;
        }
        if (totalVal <= (pageVal - 1) * limitVal) totalVal = pageVal * limitVal;

        setPagination({
          total: totalVal,
          page: pageVal,
          limit: limitVal,
          totalPages: pagesVal || 1,
        });
      } catch (err: any) {
        showToast.error(
          err?.response?.data?.message || "Failed to load doctors.",
        );
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    },
    [],
  );

  const fetchCategories = useCallback(async () => {
    try {
      const res = await doctorService.getCategoryAll();
      setCategories(res.data.data);
    } catch (err: any) {
      console.error("Failed to load specialties", err);
    }
  }, []);

  const addDoctor = async (vals: DoctorFormValues) => {
    setActionLoading(true);
    try {
      await doctorService.create(vals);
      await fetchAll(pagination.page, pagination.limit);
      showToast.success(`"${vals.name}" added successfully!`);
      return true;
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || "Failed to add doctor.");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const editDoctor = async (id: string, vals: DoctorFormValues) => {
    setActionLoading(true);
    try {
      await doctorService.update(id, vals);
      await fetchAll(pagination.page, pagination.limit);
      showToast.success(`"${vals.name}" updated successfully!`);
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

  const removeDoctor = async (id: string, name: string) => {
    setActionLoading(true);
    try {
      await doctorService.remove(id);
      await fetchAll(pagination.page, pagination.limit);
      showToast.error(`"${name}" has been deleted.`);
      return true;
    } catch (err: any) {
      showToast.error(
        err?.response?.data?.message || "Failed to delete doctor.",
      );
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const toggleStatus = async (doctor: Doctor) => {
    const nextActive = !doctor.isActive;
    try {
      await doctorService.toggleStatus(doctor._id, nextActive);
      setDoctors((prev) =>
        prev.map((d) =>
          d._id === doctor._id ? { ...d, isActive: nextActive } : d,
        ),
      );
      setCounts((prev) => ({
        ...prev,
        active: nextActive ? prev.active + 1 : prev.active - 1,
        inactive: nextActive ? prev.inactive - 1 : prev.inactive + 1,
      }));
      showToast.info(
        `"${doctor.name}" marked as ${nextActive ? "Active" : "Inactive"}.`,
      );
    } catch (err: any) {
      showToast.error(
        err?.response?.data?.message || "Failed to update status.",
      );
    }
  };

  return {
    doctors,
    counts,
    categories,
    loading,
    actionLoading,
    pagination,
    fetchAll,
    fetchCategories,
    addDoctor,
    editDoctor,
    removeDoctor,
    toggleStatus,
  };
};
