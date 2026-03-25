import { FormState, ResultRow } from "../types/labReport.types";

export const STORAGE_SIG_KEY = "admin_signature";

export const today = new Date().toISOString().slice(0, 10);

export const EMPTY_FORM: FormState = {
  patientName: "",
  doctorId: "",
  doctorName: "",
  testName: "",
  note: "",
  date: today,
};

export const QUICK_PARAMS: ResultRow[] = [
  { name: "Hemoglobin", value: "", normalRange: "13.0 - 17.0 g/dL" },
  { name: "WBC Count", value: "", normalRange: "4.5 - 11.0 ×10³/μL" },
  { name: "Platelets", value: "", normalRange: "150 - 400 ×10³/μL" },
  { name: "RBC Count", value: "", normalRange: "4.5 - 5.9 ×10⁶/μL" },
  { name: "Blood Sugar", value: "", normalRange: "70 - 100 mg/dL" },
  { name: "Cholesterol", value: "", normalRange: "< 200 mg/dL" },
  { name: "Creatinine", value: "", normalRange: "0.7 - 1.3 mg/dL" },
  { name: "Potassium", value: "", normalRange: "3.5 - 5.0 mEq/L" },
];
