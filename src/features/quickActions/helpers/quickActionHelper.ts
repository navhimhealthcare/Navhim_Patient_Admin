import { QuickAction, QuickActionFormValues } from "../types/quickAction.types";

/** Empty form – use when opening the Add modal */
export const EMPTY_QUICK_ACTION_FORM: QuickActionFormValues = {
  title: "",
  icon: null,
  existingImage: "",
};

/** Pre-fill form from an existing QuickAction (Edit flow) */
export const formFromQuickAction = (
  qa: QuickAction,
): QuickActionFormValues => ({
  title: qa.title,
  icon: null,
  existingImage: qa.icon,
});

/** Build FormData payload for create / update */
export const buildQuickActionPayload = (
  vals: QuickActionFormValues,
): FormData => {
  const fd = new FormData();
  fd.append("title", vals.title.trim());
  if (vals.icon) fd.append("icon", vals.icon);
  return fd;
};

/** Simple client-side validation */
export interface QuickActionErrors {
  title?: string;
  icon?: string;
}

export const validateQuickActionForm = (
  vals: QuickActionFormValues,
  isEdit: boolean,
): QuickActionErrors => {
  const errs: QuickActionErrors = {};
  if (!vals.title.trim()) errs.title = "Title is required.";
  if (!isEdit && !vals.icon) errs.icon = "Please upload an icon.";
  return errs;
};
