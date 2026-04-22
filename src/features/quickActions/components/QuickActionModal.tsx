import { useState, useEffect, useRef } from "react";
import { QuickActionFormValues } from "../types/quickAction.types";
import {
  EMPTY_QUICK_ACTION_FORM,
  validateQuickActionForm,
  QuickActionErrors,
} from "../helpers/quickActionHelper";
import { SpinnerIcon } from "../../../components/Loader/Loader";

const inputCls =
  "w-full h-10 border border-black/10 rounded-xl px-3 text-[13px] font-medium text-navy " +
  "placeholder:text-gray-300 outline-none focus:border-brand-primary " +
  "focus:ring-2 focus:ring-brand-primary/10 transition-all bg-white";

interface Props {
  open: boolean;
  editData: QuickActionFormValues | null;   // null = Add mode
  loading: boolean;
  onClose: () => void;
  onSubmit: (vals: QuickActionFormValues) => Promise<void>;
}

export default function QuickActionModal({
  open,
  editData,
  loading,
  onClose,
  onSubmit,
}: Props) {
  const isEdit = !!editData;
  const [form, setForm] = useState<QuickActionFormValues>(EMPTY_QUICK_ACTION_FORM);
  const [errors, setErrors] = useState<QuickActionErrors>({});
  const [preview, setPreview] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [visible, setVisible] = useState(false);

  // Animate in/out
  useEffect(() => {
    if (open) {
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
    }
  }, [open]);

  // Populate form on edit
  useEffect(() => {
    if (open) {
      if (editData) {
        setForm(editData);
        setPreview(editData.existingImage || "");
      } else {
        setForm(EMPTY_QUICK_ACTION_FORM);
        setPreview("");
      }
      setErrors({});
    }
  }, [open, editData]);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setForm((f) => ({ ...f, icon: file }));
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
    if (errors.icon) setErrors((prev) => ({ ...prev, icon: undefined }));
  };

  const handleChange = (field: keyof QuickActionFormValues, val: string) => {
    setForm((f) => ({ ...f, [field]: val }));
    if (errors[field as keyof QuickActionErrors])
      setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    const errs = validateQuickActionForm(form, isEdit);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    await onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`
          absolute inset-0 bg-navy/60 backdrop-blur-sm
          transition-opacity duration-300
          ${visible ? "opacity-100" : "opacity-0"}
        `}
        onClick={onClose}
      />

      {/* Modal panel */}
      <div
        className={`
          relative bg-white rounded-2xl shadow-2xl w-full max-w-md
          transition-all duration-300 ease-out
          ${visible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-95"
          }
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-poppins font-bold text-[16px] text-navy">
              {isEdit ? "Edit Quick Action" : "Add Quick Action"}
            </h2>
            <p className="text-[12px] text-gray-400 mt-0.5">
              {isEdit
                ? "Update the name or image of this action."
                : "Fill in the details to create a new quick action."}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-surface hover:text-navy transition-colors disabled:opacity-40"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-gray-500">
              Name <span className="text-danger">*</span>
            </label>
            <input
              className={inputCls}
              placeholder="e.g. Book Doctor"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
            {errors.title && (
              <p className="text-[11px] text-danger font-medium mt-0.5">
                {errors.title}
              </p>
            )}
          </div>

          {/* Image upload */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-gray-500">
              Image {!isEdit && <span className="text-danger">*</span>}
              {isEdit && (
                <span className="text-gray-400 font-normal ml-1">
                  (leave empty to keep current)
                </span>
              )}
            </label>

            <div
              onClick={() => fileRef.current?.click()}
              className={`
                relative w-full h-36 rounded-xl border-2 border-dashed
                flex flex-col items-center justify-center gap-2 cursor-pointer
                transition-all duration-200
                ${errors.icon
                  ? "border-danger bg-danger/5"
                  : "border-brand-primary/20 bg-brand-primary/[0.03] hover:bg-brand-primary/[0.07] hover:border-brand-primary/40"
                }
              `}
            >
              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-full object-contain rounded-xl p-2"
                  />
                  <div className="absolute inset-0 bg-navy/40 rounded-xl opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-[12px] font-semibold">
                      Click to change
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-xl">
                    🖼️
                  </div>
                  <p className="text-[12px] text-gray-400 text-center">
                    <span className="text-brand-primary font-semibold">
                      Click to upload
                    </span>{" "}
                    an image
                  </p>
                  <p className="text-[11px] text-gray-300">
                    PNG, JPG, WEBP – max 5 MB
                  </p>
                </>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {errors.icon && (
              <p className="text-[11px] text-danger font-medium mt-0.5">
                {errors.icon}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-5">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-500 hover:bg-surface transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-gradient text-white text-[13px] font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {loading ? (
              <SpinnerIcon size="sm" color="white" />
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Add Action"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
