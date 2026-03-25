import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axiosInstance from "../../../services/axiosConfig";
import { doctorService } from "../../doctors/services/doctorService";
import { patientService } from "../../patients/services/patientService";
import showToast from "../../../utils/toast";
import { FormState, ResultRow, Doctor } from "../types/labReport.types";
import { EMPTY_FORM, STORAGE_SIG_KEY } from "../utils/constants";
import { isAbnormal, calcCompleteness } from "../utils/helpers";

export const useLabReport = (patientId: string | undefined) => {
  const navigate = useNavigate();

  const [form, setFormState] = useState<FormState>(EMPTY_FORM);
  const [results, setResults] = useState<ResultRow[]>([
    { name: "", value: "", normalRange: "" },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [signature, setSignature] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_SIG_KEY),
  );

  const templateRef = useRef<HTMLDivElement>(null);

  // Fetch doctors
  useEffect(() => {
    doctorService
      .getAll()
      .then((res) => {
        const list = res.data?.data ?? [];
        setDoctors(list.map((d: any) => ({ _id: d._id, name: d.name })));
      })
      .catch(() => {});
  }, []);

  // Fetch patient name
  useEffect(() => {
    if (!patientId) return;
    patientService
      .getAll({ search: patientId })
      .then((res) => {
        const list = res.data?.data ?? [];
        const patient = list.find((p: any) => p._id === patientId);
        if (patient) setFormState((p) => ({ ...p, patientName: patient.name }));
      })
      .catch(() => {});
  }, [patientId]);

  // ── Form helpers ──
  const setField = (key: keyof FormState, val: string) => {
    setFormState((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const setResult = (idx: number, key: keyof ResultRow, val: string) => {
    setResults((p) => p.map((r, i) => (i === idx ? { ...r, [key]: val } : r)));
    setErrors((p) => ({ ...p, [`r_${idx}_${key}`]: "" }));
  };

  const addRow = () =>
    setResults((p) => [...p, { name: "", value: "", normalRange: "" }]);
  const removeRow = (idx: number) =>
    setResults((p) => p.filter((_, i) => i !== idx));
  const addQuick = (preset: ResultRow) =>
    setResults((p) => [...p.filter((r) => r.name || r.value), { ...preset }]);

  const handleDoctorChange = (id: string) => {
    const doc = doctors.find((d) => d._id === id);
    setFormState((p) => ({ ...p, doctorId: id, doctorName: doc?.name ?? "" }));
    setErrors((p) => ({ ...p, doctorId: "" }));
  };

  const handleVoiceTranscript = (text: string) => {
    setInterimText("");
    setField("note", (form.note + (form.note ? " " : "") + text).trimStart());
  };

  // ── Validation ──
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.doctorId) e.doctorId = "Select a doctor";
    if (!form.testName.trim()) e.testName = "Test name is required";
    if (!form.patientName.trim()) e.patientName = "Patient name is required";
    if (!form.note.trim()) e.note = "Doctor's note is required";
    results.forEach((r, i) => {
      if (!r.name.trim()) e[`r_${i}_name`] = "Required";
      if (!r.value.trim()) e[`r_${i}_value`] = "Required";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── PDF generation ──
  const generatePdfBlob = useCallback(async (): Promise<File | null> => {
    if (!templateRef.current) return null;
    setGenerating(true);
    try {
      const canvas = await html2canvas(templateRef.current, {
        scale: 1.5, // scale 2 → 10 MB, scale 1.5 → ~2-3 MB (still print quality)
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      // Compress: use JPEG at 85% quality instead of raw PNG
      const imgData = canvas.toDataURL("image/jpeg", 0.85);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      pdf.addImage(imgData, "JPEG", 0, 0, pdfW, pdfH);
      return new File([pdf.output("blob")], `NavhimReport_${Date.now()}.pdf`, {
        type: "application/pdf",
      });
    } finally {
      setGenerating(false);
    }
  }, []);

  const handleDownloadPreview = async () => {
    const file = await generatePdfBlob();
    if (!file) return;
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
    showToast.success("PDF downloaded!");
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!validate()) {
      showToast.warn("Please fix the errors before submitting.");
      return;
    }
    setLoading(true);
    try {
      const pdfFile = await generatePdfBlob();
      if (!pdfFile) throw new Error("PDF generation failed");
      const fd = new FormData();
      fd.append("patientId", patientId ?? "");
      fd.append("doctorId", form.doctorId);
      fd.append("testName", form.testName.trim());
      fd.append("note", form.note.trim());
      fd.append(
        "results",
        JSON.stringify(
          results.map((r) => ({
            name: r.name.trim(),
            value: r.value.trim(),
            normalRange: r.normalRange.trim(),
          })),
        ),
      );
      fd.append("pdfKey", pdfFile);
      const token = localStorage.getItem("jwt_token") ?? "";
      const baseURL = import.meta.env.VITE_API_URL ?? "";

      const response = await fetch(`${baseURL}/api/reports/create-for-patient`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || `Server error ${response.status}`);
      }

      showToast.success("Report created and PDF uploaded!");
      navigate(-1);
    } catch (err: any) {
      showToast.error(err?.message || "Failed to submit report.");
    } finally {
      setLoading(false);
    }
  };

  // ── Derived ──
  const isBusy = loading || generating;
  const paramCount = results.filter((r) => r.name).length;
  const abnormalCount = results.filter((r) => r.name && isAbnormal(r)).length;
  const completeness = calcCompleteness(
    form.patientName,
    form.doctorId,
    form.testName,
    paramCount,
  );

  return {
    // State
    form,
    results,
    errors,
    doctors,
    signature,
    interimText,
    isBusy,
    generating,
    paramCount,
    abnormalCount,
    completeness,
    templateRef,
    // Actions
    setField,
    setResult,
    addRow,
    removeRow,
    addQuick,
    handleDoctorChange,
    handleVoiceTranscript,
    setInterimText,
    setSignature,
    handleDownloadPreview,
    handleSubmit,
  };
};
