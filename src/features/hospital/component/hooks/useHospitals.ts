import { useState, useEffect, useCallback, useRef } from "react";
import {
  Hospital,
  HospitalFormValues,
  PaginationMeta,
  HospitalFilter,
} from "../../component/types/hospital.types";
import { hospitalService } from "../hospitalService";
import { buildHospitalPayload } from "../hospitalHelpers";
import showToast from "../../../../utils/toast";

const DEFAULT_LIMIT = 10;

export const useHospitals = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [counts, setCounts] = useState<{
    total: number;
    active: number;
    inactive: number;
  }>({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: DEFAULT_LIMIT,
    totalPages: 1,
  });
  const isFetching = useRef(false);

  /* ── Fetch ── */
  const fetchAll = useCallback(
    async (page = 1, limit = DEFAULT_LIMIT, filters: Partial<HospitalFilter> = {}) => {
      if (isFetching.current) return;
      isFetching.current = true;
      setLoading(true);
      try {
        const params: any = {
          page: Number(page) || 1,
          limit: Number(limit) || DEFAULT_LIMIT,
          ...filters,
        };

        // Map status
        if (filters.status === "active") params.isActive = true;
        else if (filters.status === "inactive") params.isActive = false;
        delete params.status;

        // Clean empty params
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

        const res = await hospitalService.getAll(params);
        const body = res.data;

        // Updated for new structure: body.data.hospitals and body.data.counts
        const list = Array.isArray(body.data?.hospitals)
          ? body.data.hospitals
          : Array.isArray(body.data)
          ? body.data
          : Array.isArray(body)
          ? body
          : [];

        if (body.data?.counts) {
          setCounts(body.data.counts);
        }

        const mapped = list.map((h: any) => ({ ...h, isActive: !!h.isActive }));
        setHospitals(mapped);

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
        let limitVal = Number(limit) || DEFAULT_LIMIT;
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
        if (totalVal === 0) totalVal = mapped.length;

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
        if (mapped.length >= limitVal) {
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
          err?.response?.data?.message || "Failed to load hospitals.",
        );
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    },
    [],
  );

  useEffect(() => {
    // We'll let the Page component handle the initial fetch with filters
  }, []);

  /* ── Add ── */
  const addHospital = async (form: HospitalFormValues): Promise<boolean> => {
    setActionLoading(true);
    try {
      await hospitalService.create(buildHospitalPayload(form));
      await fetchAll(pagination.page, pagination.limit);
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
      await hospitalService.update(id, buildHospitalPayload(form));
      await fetchAll(pagination.page, pagination.limit);
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
      await fetchAll(pagination.page, pagination.limit);
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
    const nextActive = !hospital.isActive;
    try {
      await hospitalService.toggleStatus(hospital._id, nextActive);
      setHospitals((prev) =>
        prev.map((h) =>
          h._id === hospital._id ? { ...h, isActive: nextActive } : h,
        ),
      );
      // Also update counts locally to avoid full fetch if possible, 
      // but status change affects active/inactive counts.
      setCounts(prev => ({
        ...prev,
        active: nextActive ? prev.active + 1 : prev.active - 1,
        inactive: nextActive ? prev.inactive - 1 : prev.inactive + 1
      }));
      showToast.info(
        `"${hospital.name}" marked as ${nextActive ? "Active" : "Inactive"}.`,
      );
    } catch (err: any) {
      showToast.error(
        err?.response?.data?.message || "Failed to update status.",
      );
    }
  };

  return {
    hospitals,
    counts,
    loading,
    actionLoading,
    pagination,
    fetchAll,
    addHospital,
    editHospital,
    removeHospital,
    toggleStatus,
  };
};
