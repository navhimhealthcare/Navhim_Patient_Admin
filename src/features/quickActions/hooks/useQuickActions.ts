import { useState, useCallback, useRef } from "react";
import { QuickAction, QuickActionFormValues } from "../types/quickAction.types";
import { quickActionService } from "../services/quickActionService";
import {
  buildQuickActionPayload,
  formFromQuickAction,
} from "../helpers/quickActionHelper";
import showToast from "../../../utils/toast";

export const useQuickActions = () => {
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const isFetching = useRef(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    try {
      const res = await quickActionService.getAll();
      const list = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? (res.data as unknown as QuickAction[])
          : [];
      setQuickActions(list);
    } catch (err: any) {
      showToast.error(
        err?.response?.data?.message || "Failed to load quick actions.",
      );
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  // ── Fetch One ──────────────────────────────────────────────────────────────
  const getQuickActionById = useCallback(async (id: string) => {
    setActionLoading(true);
    try {
      const res = await quickActionService.getById(id);
      return res.data?.data || null;
    } catch (err: any) {
      showToast.error(
        err?.response?.data?.message || "Failed to load quick action details.",
      );
      return null;
    } finally {
      setActionLoading(false);
    }
  }, []);

  // ── Create ─────────────────────────────────────────────────────────────────
  const addQuickAction = async (vals: QuickActionFormValues) => {
    setActionLoading(true);
    try {
      const fd = buildQuickActionPayload(vals);
      const res = await quickActionService.create(fd);
      await fetchAll();
      showToast.success(res.data?.message);
      return true;
    } catch (err: any) {
      showToast.error(
        err?.response?.data?.message || "Failed to add quick action.",
      );
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // ── Update ─────────────────────────────────────────────────────────────────
  const editQuickAction = async (id: string, vals: QuickActionFormValues) => {
    setActionLoading(true);
    try {
      const hasNewImage = !!vals.icon;
      const payload = hasNewImage
        ? buildQuickActionPayload(vals)
        : {
            title: vals.title.trim(),
          };
      const res = await quickActionService.update(id, payload, hasNewImage);
      await fetchAll();
      showToast.success(res.data?.message);
      return true;
    } catch (err: any) {
      showToast.error(
        err?.response?.data?.message || "Failed to update quick action.",
      );
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const removeQuickAction = async (id: string, title: string) => {
    setActionLoading(true);
    try {
      const res = await quickActionService.remove(id);
      setQuickActions((prev) => prev.filter((qa) => qa._id !== id));
      showToast.success(res.data?.message);
      return true;
    } catch (err: any) {
      showToast.error(
        err?.response?.data?.message || "Failed to delete quick action.",
      );
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    quickActions,
    loading,
    actionLoading,
    fetchAll,
    getQuickActionById,
    addQuickAction,
    editQuickAction,
    removeQuickAction,
    formFromQuickAction,
  };
};
