import { useState, useEffect, useCallback } from "react";
import { Category } from "../types/category.types";
import { categoryService } from "../services/categoryService";
import showToast from "../../../utils/toast";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoryService.getAll();
      setCategories(res.data.data);
    } catch (err: any) {
      showToast.error(
        err?.response?.data?.message || "Failed to load categories.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    categories,
    loading,
    actionLoading,
    fetchAll,
  };
};
