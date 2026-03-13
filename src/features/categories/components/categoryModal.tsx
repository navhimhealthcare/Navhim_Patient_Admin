import { useState, useEffect, useRef } from "react";
import { Category, CategoryFormValues } from "../types/category.types";
import { SpinnerIcon } from "../../../components/Loader/Loader";
import folderIcon from "../../../assets/images/folder.png";

const inputCls =
  "w-full h-10 border border-black/10 rounded-xl px-3 text-[13px] font-medium text-navy " +
  "placeholder:text-gray-300 outline-none focus:border-brand-primary " +
  "focus:ring-2 focus:ring-brand-primary/10 transition-all bg-white";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: CategoryFormValues) => Promise<boolean>;
  initialData: Category | null;
  loading: boolean;
}

export default function CategoryModal({
  open,
  onClose,
  onSubmit,
  initialData,
  loading,
}: Props) {
  const [form, setForm] = useState<CategoryFormValues>({
    name: "",
    isActive: true,
  });
  const [error, setError] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  const isEdit = !!initialData;

  useEffect(() => {
    if (open) {
      setForm(
        initialData
          ? { name: initialData.name, isActive: initialData.isActive }
          : { name: "", isActive: true },
      );
      setError("");
      setTimeout(() => ref.current?.focus(), 80);
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Category name is required");
      return;
    }
    const ok = await onSubmit(form);
    if (ok) onClose();
  };

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
              <img src={folderIcon} alt="cat" className="w-4 h-4 opacity-70" />
            </div>
            <div>
              <h2 className="font-poppins font-bold text-white text-[16px]">
                {isEdit ? "Edit Category" : "Add Category"}
              </h2>
              <p className="text-white/60 text-[11px]">
                {isEdit ? "Update category details" : "Create a new category"}
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
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-gray-500">
              Category Name <span className="text-danger">*</span>
            </label>
            <input
              ref={ref}
              value={form.name}
              onChange={(e) => {
                setForm((p) => ({ ...p, name: e.target.value }));
                setError("");
              }}
              placeholder="e.g. Common Health Issues"
              className={inputCls}
            />
            {error && (
              <p className="text-[11px] text-danger font-medium">{error}</p>
            )}
          </div>

          {/* Active toggle */}
          {/* <div className="flex items-center justify-between bg-surface rounded-xl px-4 py-3">
            <div>
              <p className="text-[13px] font-semibold text-navy">Active Category</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {form.isActive ? 'Visible to users' : 'Hidden from users'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg
                ${form.isActive ? 'bg-success-bg text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                {form.isActive ? 'Active' : 'Inactive'}
              </span>
              <div onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
                className={`relative rounded-full cursor-pointer transition-colors duration-200 flex-shrink-0
                  ${form.isActive ? 'bg-brand-primary' : 'bg-gray-200'}`}
                style={{ width: 36, height: 20 }}>
                <div className={`absolute top-[3px] w-[14px] h-[14px] bg-white rounded-full shadow
                  transition-transform duration-200
                  ${form.isActive ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
              </div>
            </div>
          </div> */}
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
            {isEdit ? "Save Changes" : "Add Category"}
          </button>
        </div>
      </div>
    </div>
  );
}

// import { useState, useEffect, useRef } from "react";
// import { Category, CategoryFormValues } from "../types/category.types";
// import { SpinnerIcon } from "../../../components/Loader/Loader";
// import editIcon from "../../../assets/images/edit.png";
// import folderIcon from "../../../assets/images/folder.png";

// const inputCls =
//   "w-full h-10 border border-black/10 rounded-xl px-3 text-[13px] font-medium text-navy " +
//   "placeholder:text-gray-300 outline-none focus:border-brand-primary " +
//   "focus:ring-2 focus:ring-brand-primary/10 transition-all bg-white";

// interface Props {
//   open: boolean;
//   onClose: () => void;
//   onSubmit: (form: CategoryFormValues) => Promise<boolean>;
//   initialData: Category | null;
//   loading: boolean;
// }

// export default function CategoryModal({
//   open,
//   onClose,
//   onSubmit,
//   initialData,
//   loading,
// }: Props) {
//   const [form, setForm] = useState<CategoryFormValues>({
//     name: "",
//     isActive: true,
//   });
//   const [error, setError] = useState("");
//   const ref = useRef<HTMLInputElement>(null);
//   const isEdit = !!initialData;

//   useEffect(() => {
//     if (open) {
//       setForm(
//         initialData
//           ? { name: initialData.name, isActive: initialData.isActive }
//           : { name: "", isActive: true },
//       );
//       setError("");
//       setTimeout(() => ref.current?.focus(), 80);
//     }
//   }, [open, initialData]);

//   if (!open) return null;

//   const handleSubmit = async () => {
//     if (!form.name.trim()) {
//       setError("Category name is required");
//       return;
//     }
//     const ok = await onSubmit(form);
//     if (ok) onClose();
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div
//         className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
//         onClick={onClose}
//       />

//       <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md animate-[fadeUp_0.25s_ease_both] overflow-hidden">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-brand-primary to-brand-gradient px-6 py-5 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
//               <img src={folderIcon} alt="cat" className="w-4 h-4 brightness-0 invert opacity-70" />
//             </div>
//             <div>
//               <h2 className="font-poppins font-bold text-white text-[16px]">
//                 {isEdit ? "Edit Category" : "Add Category"}
//               </h2>
//               <p className="text-white/60 text-[11px]">
//                 {isEdit ? "Update category details" : "Create a new category"}
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
//           >
//             ✕
//           </button>
//         </div>

//         {/* Body */}
//         <div className="px-6 py-5 flex flex-col gap-4">
//           {/* Name + Active in one row */}
//           <div className="flex gap-3 items-start">
//             {/* Name — takes most space */}
//             <div className="flex flex-col gap-1 flex-1">
//               <label className="text-[12px] font-semibold text-gray-500">
//                 Category Name <span className="text-danger">*</span>
//               </label>
//               <input
//                 ref={ref}
//                 value={form.name}
//                 onChange={(e) => {
//                   setForm((p) => ({ ...p, name: e.target.value }));
//                   setError("");
//                 }}
//                 placeholder="e.g. Common Health Issues"
//                 className={inputCls}
//               />
//               {error && (
//                 <p className="text-[11px] text-danger font-medium">{error}</p>
//               )}
//             </div>

//             {/* Active toggle — compact right side */}
//             <div className="flex flex-col gap-1 flex-shrink-0">
//               <label className="text-[12px] font-semibold text-gray-500">
//                 Status
//               </label>
//               <button
//                 type="button"
//                 onClick={() =>
//                   setForm((p) => ({ ...p, isActive: !p.isActive }))
//                 }
//                 className={`h-10 px-4 rounded-xl border text-[12.5px] font-semibold flex items-center gap-2 transition-all
//                   ${
//                     form.isActive
//                       ? "bg-success-bg border-green-200 text-green-700"
//                       : "bg-gray-50 border-gray-200 text-gray-400"
//                   }`}
//               >
//                 <span
//                   className={`w-2 h-2 rounded-full flex-shrink-0
//                   ${form.isActive ? "bg-green-500" : "bg-gray-300"}`}
//                 />
//                 {form.isActive ? "Active" : "Inactive"}
//               </button>
//             </div>
//           </div>

//           {/* Info strip — only for add */}
//           {!isEdit && (
//             <div className="flex items-center gap-2 bg-brand-lighter border border-brand-primary/15 rounded-xl px-3 py-2.5">
//               <span className="text-sm flex-shrink-0">💡</span>
//               <p className="text-[11.5px] text-brand-primary font-medium">
//                 You can add sub-categories after creating this category.
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="px-6 pb-6 pt-2 flex gap-3 justify-end border-t border-brand-primary/[0.08]">
//           <button
//             onClick={onClose}
//             disabled={loading}
//             className="px-5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-500 hover:bg-surface transition-colors disabled:opacity-50"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={loading}
//             className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-gradient text-white text-[13px] font-semibold shadow-btn hover:opacity-90 disabled:opacity-60 transition-opacity"
//           >
//             {loading && (
//               <SpinnerIcon size="sm" color="white" />
//             )}
//             {isEdit ? "Save Changes" : "Add Category"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
