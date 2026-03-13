import { useState, useEffect, useCallback } from 'react'
import { Category, SubCategory, CategoryFormValues, SubCategoryFormValues } from '../types/category.types'
import { categoryService } from '../services/categoryService'
import showToast           from '../../../utils/toast'

export const useCategories = () => {
  const [categories,    setCategories]    = useState<Category[]>([])
  const [loading,       setLoading]       = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const res = await categoryService.getAll()
      setCategories(res.data.data)
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Failed to load categories.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Category CRUD ──────────────────────────────────────────────────
  const addCategory = async (form: CategoryFormValues): Promise<boolean> => {
    setActionLoading(true)
    try {
      const res = await categoryService.createCategory(form)
      setCategories(p => [...p, { ...res.data.data, subCategories: [] }])
      showToast.success(`"${form.name}" category added!`)
      return true
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Failed to add category.')
      return false
    } finally { setActionLoading(false) }
  }

  const editCategory = async (id: string, form: CategoryFormValues): Promise<boolean> => {
    setActionLoading(true)
    try {
      const res = await categoryService.updateCategory(id, form)
      setCategories(p => p.map(c =>
        c._id === id ? { ...res.data.data, subCategories: c.subCategories } : c
      ))
      showToast.success(`Category updated!`)
      return true
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Failed to update category.')
      return false
    } finally { setActionLoading(false) }
  }

  const removeCategory = async (cat: Category): Promise<boolean> => {
    setActionLoading(true)
    try {
      await categoryService.deleteCategory(cat._id)
      setCategories(p => p.filter(c => c._id !== cat._id))
      showToast.warn(`"${cat.name}" removed.`)
      return true
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Failed to delete category.')
      return false
    } finally { setActionLoading(false) }
  }

  const toggleCategory = async (cat: Category): Promise<void> => {
    try {
      await categoryService.toggleCategory(cat._id, !cat.isActive)
      setCategories(p => p.map(c =>
        c._id === cat._id ? { ...c, isActive: !c.isActive } : c
      ))
      showToast.info(`"${cat.name}" marked ${cat.isActive ? 'inactive' : 'active'}.`)
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Failed to update status.')
    }
  }

  // ── SubCategory CRUD ───────────────────────────────────────────────
  const buildSubPayload = (form: SubCategoryFormValues): FormData => {
    const fd = new FormData()
    fd.append('name',       form.name.trim())
    fd.append('category',   form.categoryId)
    fd.append('isActive',   String(form.isActive))
    if (form.icon)         fd.append('icon', form.icon)
    else if (form.existingIcon) fd.append('icon', form.existingIcon)
    return fd
  }

  const addSubCategory = async (form: SubCategoryFormValues): Promise<boolean> => {
    setActionLoading(true)
    try {
      const res = await categoryService.createSubCategory(buildSubPayload(form))
      setCategories(p => p.map(c =>
        c._id === form.categoryId
          ? { ...c, subCategories: [...c.subCategories, res.data.data] }
          : c
      ))
      showToast.success(`"${form.name}" sub-category added!`)
      return true
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Failed to add sub-category.')
      return false
    } finally { setActionLoading(false) }
  }

  const editSubCategory = async (id: string, form: SubCategoryFormValues): Promise<boolean> => {
    setActionLoading(true)
    try {
      const res = await categoryService.updateSubCategory(id, buildSubPayload(form))
      setCategories(p => p.map(c =>
        c._id === form.categoryId
          ? { ...c, subCategories: c.subCategories.map(s => s._id === id ? res.data.data : s) }
          : c
      ))
      showToast.success(`Sub-category updated!`)
      return true
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Failed to update sub-category.')
      return false
    } finally { setActionLoading(false) }
  }

  const removeSubCategory = async (sub: SubCategory, categoryId: string): Promise<boolean> => {
    setActionLoading(true)
    try {
      await categoryService.deleteSubCategory(sub._id)
      setCategories(p => p.map(c =>
        c._id === categoryId
          ? { ...c, subCategories: c.subCategories.filter(s => s._id !== sub._id) }
          : c
      ))
      showToast.warn(`"${sub.name}" removed.`)
      return true
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Failed to delete sub-category.')
      return false
    } finally { setActionLoading(false) }
  }

  const toggleSubCategory = async (sub: SubCategory, categoryId: string): Promise<void> => {
    try {
      await categoryService.toggleSubCategory(sub._id, !sub.isActive)
      setCategories(p => p.map(c =>
        c._id === categoryId
          ? { ...c, subCategories: c.subCategories.map(s => s._id === sub._id ? { ...s, isActive: !s.isActive } : s) }
          : c
      ))
      showToast.info(`"${sub.name}" marked ${sub.isActive ? 'inactive' : 'active'}.`)
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Failed to update status.')
    }
  }

  return {
    categories, loading, actionLoading, fetchAll,
    addCategory, editCategory, removeCategory, toggleCategory,
    addSubCategory, editSubCategory, removeSubCategory, toggleSubCategory,
  }
}