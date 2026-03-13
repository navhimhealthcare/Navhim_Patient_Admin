import { useState, useEffect, useRef } from "react";
import {
  SubCategory,
  SubCategoryFormValues,
  Category,
} from "../types/category.types";
import { SpinnerIcon } from "../../../components/Loader/Loader";
import deleteIcon from "../../../assets/images/delete.png";

const inputCls =
  "w-full h-10 border border-black/10 rounded-xl px-3 text-[13px] font-medium text-navy " +
  "placeholder:text-gray-300 outline-none focus:border-brand-primary " +
  "focus:ring-2 focus:ring-brand-primary/10 transition-all bg-white";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: SubCategoryFormValues) => Promise<boolean>;
  initialData: SubCategory | null;
  defaultCategory: Category | null; // pre-selected when clicking "Add Sub" from row
  categories: Category[];
  loading: boolean;
}

export default function SubCategoryModal({
  open,
  onClose,
  onSubmit,
  initialData,
  defaultCategory,
  categories,
  loading,
}: Props) {
  const EMPTY: SubCategoryFormValues = {
    name: "",
    categoryId: defaultCategory?._id ?? "",
    icon: null,
    existingIcon: "",
    isActive: true,
  };

  const [form, setForm] = useState<SubCategoryFormValues>(EMPTY);
  const [errors, setErrors] = useState<
    Partial<Record<keyof SubCategoryFormValues, string>>
  >({});
  const ref = useRef<HTMLInputElement>(null);
  const isEdit = !!initialData;

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          name: initialData.name,
          categoryId: initialData.category,
          icon: null,
          existingIcon: initialData.icon ?? "",
          isActive: initialData.isActive,
        });
      } else {
        setForm({ ...EMPTY, categoryId: defaultCategory?._id ?? "" });
      }
      setErrors({});
      setTimeout(() => ref.current?.focus(), 80);
    }
  }, [open, initialData, defaultCategory]);

  if (!open) return null;

  const validate = () => {
    const e: Partial<Record<keyof SubCategoryFormValues, string>> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.categoryId) e.categoryId = "Category is required";
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    const ok = await onSubmit(form);
    if (ok) onClose();
  };

  const iconPreview = form.icon
    ? URL.createObjectURL(form.icon)
    : form.existingIcon || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm animate-[fadeUp_0.25s_ease_both] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-primary to-brand-gradient px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-xl">
              📋
            </div>
            <div>
              <h2 className="font-poppins font-bold text-white text-[16px]">
                {isEdit ? "Edit SubCategory" : "Add SubCategory"}
              </h2>
              <p className="text-white/60 text-[11px]">
                {defaultCategory
                  ? `Under: ${defaultCategory.name}`
                  : "Select a parent category"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Parent category — only show if not pre-selected */}
          {!defaultCategory && (
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-gray-500">
                Parent Category <span className="text-danger">*</span>
              </label>
              <select
                value={form.categoryId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, categoryId: e.target.value }))
                }
                className={inputCls}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-[11px] text-danger">{errors.categoryId}</p>
              )}
            </div>
          )}

          {/* Name */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-gray-500">
              Name <span className="text-danger">*</span>
            </label>
            <input
              ref={ref}
              value={form.name}
              onChange={(e) => {
                setForm((p) => ({ ...p, name: e.target.value }));
                setErrors((p) => ({ ...p, name: "" }));
              }}
              placeholder="e.g. Stomach Pain"
              className={inputCls}
            />
            {errors.name && (
              <p className="text-[11px] text-danger">{errors.name}</p>
            )}
          </div>

          {/* Icon upload */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-gray-500">
              Icon Image
            </label>
            <div className="flex items-center gap-3">
              {/* Preview */}
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 border-dashed border-brand-primary/20 bg-surface flex items-center justify-center">
                {iconPreview ? (
                  <img
                    src={iconPreview}
                    alt="icon"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <span className="text-2xl">🖼️</span>
                )}
              </div>
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-brand-primary/30 hover:border-brand-primary hover:bg-brand-lighter transition-all">
                  <span className="text-sm">📷</span>
                  <span className="text-[12px] font-semibold text-gray-500 truncate">
                    {form.icon
                      ? form.icon.name
                      : iconPreview
                        ? "Change icon"
                        : "Upload icon (PNG, WEBP)"}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/png,image/webp,image/jpeg"
                  className="sr-only"
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      icon: e.target.files?.[0] ?? null,
                    }))
                  }
                />
              </label>
              {form.icon && (
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, icon: null }))}
                  className="w-8 h-8 rounded-lg bg-danger-bg text-danger flex items-center justify-center text-sm hover:bg-red-100 transition-colors"
                >
                  ✕
                </button>
              )}
              {!form.icon && form.existingIcon && (
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, existingIcon: "" }))}
                  className="w-8 h-8 rounded-lg bg-danger-bg text-danger flex items-center justify-center text-sm hover:bg-red-100 transition-colors"
                >
                  <img src={deleteIcon} alt="remove" className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between bg-surface rounded-xl px-4 py-3">
            <p className="text-[13px] font-semibold text-navy">Active</p>
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-lg
                ${form.isActive ? "bg-success-bg text-green-700" : "bg-gray-100 text-gray-400"}`}
              >
                {form.isActive ? "Active" : "Inactive"}
              </span>
              <div
                onClick={() =>
                  setForm((p) => ({ ...p, isActive: !p.isActive }))
                }
                className={`relative rounded-full cursor-pointer transition-colors duration-200 flex-shrink-0
                  ${form.isActive ? "bg-brand-primary" : "bg-gray-200"}`}
                style={{ width: 36, height: 20 }}
              >
                <div
                  className={`absolute top-[3px] w-[14px] h-[14px] bg-white rounded-full shadow
                  transition-transform duration-200
                  ${form.isActive ? "translate-x-[18px]" : "translate-x-[3px]"}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-500 hover:bg-surface transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-gradient text-white text-[13px] font-semibold shadow-btn hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {loading && <SpinnerIcon size="sm" color="white" />}
            {isEdit ? "Save Changes" : "Add SubCategory"}
          </button>
        </div>
      </div>
    </div>
  );
}

// import { useState, useEffect, useRef } from 'react'
// import { SubCategory, SubCategoryFormValues, Category } from '../types/category.types'
// import { SpinnerIcon }                                   from '../../../components/Loader/Loader'
// import editIcon                                          from '../../../assets/images/edit.png'
// import deleteIcon                                        from '../../../assets/images/delete.png'
// import searchIcon                                        from '../../../assets/images/search.png'
// import folderIcon                                        from '../../../assets/images/folder.png'

// const inputCls =
//   'w-full h-10 border border-black/10 rounded-xl px-3 text-[13px] font-medium text-navy ' +
//   'placeholder:text-gray-300 outline-none focus:border-brand-primary ' +
//   'focus:ring-2 focus:ring-brand-primary/10 transition-all bg-white'

// interface Props {
//   open:            boolean
//   onClose:         () => void
//   onSubmit:        (form: SubCategoryFormValues) => Promise<boolean>
//   initialData:     SubCategory | null
//   defaultCategory: Category | null
//   categories:      Category[]
//   loading:         boolean
// }

// export default function SubCategoryModal({
//   open, onClose, onSubmit, initialData, defaultCategory, categories, loading,
// }: Props) {
//   const EMPTY: SubCategoryFormValues = {
//     name:         '',
//     categoryId:   defaultCategory?._id ?? '',
//     icon:         null,
//     existingIcon: '',
//     isActive:     true,
//   }

//   const [form,   setForm]   = useState<SubCategoryFormValues>(EMPTY)
//   const [errors, setErrors] = useState<Partial<Record<keyof SubCategoryFormValues, string>>>({})
//   const ref    = useRef<HTMLInputElement>(null)
//   const isEdit = !!initialData

//   useEffect(() => {
//     if (open) {
//       if (initialData) {
//         setForm({
//           name:         initialData.name,
//           categoryId:   initialData.category,
//           icon:         null,
//           existingIcon: initialData.icon ?? '',
//           isActive:     initialData.isActive,
//         })
//       } else {
//         setForm({ ...EMPTY, categoryId: defaultCategory?._id ?? '' })
//       }
//       setErrors({})
//       setTimeout(() => ref.current?.focus(), 80)
//     }
//   }, [open, initialData, defaultCategory])

//   if (!open) return null

//   const validate = () => {
//     const e: Partial<Record<keyof SubCategoryFormValues, string>> = {}
//     if (!form.name.trim()) e.name       = 'Name is required'
//     if (!form.categoryId)  e.categoryId = 'Category is required'
//     return e
//   }

//   const handleSubmit = async () => {
//     const errs = validate()
//     if (Object.keys(errs).length) { setErrors(errs); return }
//     const ok = await onSubmit(form)
//     if (ok) onClose()
//   }

//   const iconPreview = form.icon
//     ? URL.createObjectURL(form.icon)
//     : form.existingIcon || null

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={onClose} />

//       <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md animate-[fadeUp_0.25s_ease_both] overflow-hidden">

//         {/* Header */}
//         <div className="bg-gradient-to-r from-brand-primary to-brand-gradient px-6 py-5 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             {/* Icon preview in header */}
//             <div className="w-9 h-9 rounded-xl bg-white/15 overflow-hidden flex items-center justify-center flex-shrink-0">
//               {iconPreview ? (
//                 <img src={iconPreview} alt="icon" className="w-full h-full object-contain p-1" />
//               ) : (
//                 <span className="text-xl">📋</span>
//               )}
//             </div>
//             <div>
//               <h2 className="font-poppins font-bold text-white text-[16px]">
//                 {isEdit ? 'Edit Sub-Category' : 'Add Sub-Category'}
//               </h2>
//               <p className="text-white/60 text-[11px]">
//                 {defaultCategory ? `Under: ${defaultCategory.name}` : 'Select a parent category'}
//               </p>
//             </div>
//           </div>
//           <button onClick={onClose}
//             className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
//             ✕
//           </button>
//         </div>

//         {/* Body */}
//         <div className="px-6 py-5 flex flex-col gap-4">

//           {/* Row 1: Icon upload + Name side by side */}
//           <div className="flex gap-3 items-start">

//             {/* Icon upload — compact left block */}
//             <div className="flex flex-col gap-1 flex-shrink-0">
//               <label className="text-[12px] font-semibold text-gray-500">Icon</label>
//               <label className="cursor-pointer group">
//                 <div className="w-[72px] h-10 rounded-xl border border-dashed border-brand-primary/30 bg-surface hover:border-brand-primary hover:bg-brand-lighter transition-all flex items-center justify-center overflow-hidden">
//                   {iconPreview ? (
//                     <img src={iconPreview} alt="icon" className="w-full h-full object-contain p-1.5" />
//                   ) : (
//                     <span className="text-[18px]">📷</span>
//                   )}
//                 </div>
//                 <input type="file" accept="image/png,image/webp,image/jpeg" className="sr-only"
//                   onChange={e => setForm(p => ({ ...p, icon: e.target.files?.[0] ?? null }))} />
//               </label>
//               {(form.icon || form.existingIcon) && (
//                 <button type="button"
//                   onClick={() => setForm(p => ({ ...p, icon: null, existingIcon: '' }))}
//                   className="text-[10.5px] text-danger font-semibold hover:underline text-center flex items-center justify-center gap-1 mt-1">
//                   <img src={deleteIcon} alt="remove" className="w-2.5 h-2.5" /> Remove
//                 </button>
//               )}
//             </div>

//             {/* Name — takes remaining space */}
//             <div className="flex flex-col gap-1 flex-1">
//               <label className="text-[12px] font-semibold text-gray-500">
//                 Name <span className="text-danger">*</span>
//               </label>
//               <input
//                 ref={ref}
//                 value={form.name}
//                 onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: '' })) }}
//                 placeholder="e.g. Stomach Pain"
//                 className={inputCls}
//               />
//               {errors.name && <p className="text-[11px] text-danger font-medium">{errors.name}</p>}
//             </div>

//             {/* Status — compact right */}
//             <div className="flex flex-col gap-1 flex-shrink-0">
//               <label className="text-[12px] font-semibold text-gray-500">Status</label>
//               <button
//                 type="button"
//                 onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
//                 className={`h-10 px-3 rounded-xl border text-[12px] font-semibold flex items-center gap-1.5 transition-all
//                   ${form.isActive
//                     ? 'bg-success-bg border-green-200 text-green-700'
//                     : 'bg-gray-50 border-gray-200 text-gray-400'
//                   }`}>
//                 <span className={`w-2 h-2 rounded-full flex-shrink-0
//                   ${form.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
//                 {form.isActive ? 'Active' : 'Inactive'}
//               </button>
//             </div>
//           </div>

//           {/* Row 2: Parent category — only if not pre-selected */}
//           {!defaultCategory && (
//             <div className="flex flex-col gap-1">
//               <label className="text-[12px] font-semibold text-gray-500">
//                 Parent Category <span className="text-danger">*</span>
//               </label>
//               <select
//                 value={form.categoryId}
//                 onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}
//                 className={inputCls}>
//                 <option value="">Select category</option>
//                 {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
//               </select>
//               {errors.categoryId && <p className="text-[11px] text-danger">{errors.categoryId}</p>}
//             </div>
//           )}

//           {/* Parent badge — shown when pre-selected */}
//           {defaultCategory && (
//             <div className="flex items-center gap-2 bg-surface rounded-xl px-3 py-2.5">
//               <div className="w-6 h-6 rounded-lg bg-brand-primary/10 flex items-center justify-center">
//                 <img src={folderIcon} alt="parent" className="w-3 h-3 opacity-60" />
//               </div>
//               <div className="flex-1">
//                 <p className="text-[11px] text-gray-400 font-medium">Parent Category</p>
//                 <p className="text-[13px] font-bold text-navy">{defaultCategory.name}</p>
//               </div>
//               <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full
//                 ${defaultCategory.isActive ? 'bg-success-bg text-green-700' : 'bg-gray-100 text-gray-400'}`}>
//                 {defaultCategory.isActive ? 'Active' : 'Inactive'}
//               </span>
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="px-6 pb-6 pt-2 flex gap-3 justify-end border-t border-brand-primary/[0.08]">
//           <button onClick={onClose} disabled={loading}
//             className="px-5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-500 hover:bg-surface transition-colors disabled:opacity-50">
//             Cancel
//           </button>
//           <button onClick={handleSubmit} disabled={loading}
//             className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-gradient text-white text-[13px] font-semibold shadow-btn hover:opacity-90 disabled:opacity-60 transition-opacity">
//             {loading && <SpinnerIcon size="sm" color="white" />}
//             {isEdit ? 'Save Changes' : 'Add Sub-Category'}
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }
