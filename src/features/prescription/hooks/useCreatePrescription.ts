import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axiosInstance from "../../../services/axiosConfig";
import { doctorService } from "../../doctors/services/doctorService";
import { patientService } from "../../patients/services/patientService";
import showToast from "../../../utils/toast";
import { PrescriptionForm, MedicineForm } from "../types/prescription.types";
import { EMPTY_FORM, EMPTY_MEDICINE } from "../utils/prescriptionUtils";
import { calcPrescriptionCompleteness } from "../utils/prescriptionUtils";

interface Doctor {
  _id: string;
  name: string;
}

export const useCreatePrescription = (patientId: string | undefined) => {
  const navigate = useNavigate();

  const [form, setFormState] = useState<PrescriptionForm>(EMPTY_FORM);
  const [medicines, setMedicines] = useState<MedicineForm[]>([
    { ...EMPTY_MEDICINE },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

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
  const setField = (key: keyof PrescriptionForm, val: string) => {
    setFormState((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const handleDoctorChange = (id: string) => {
    const doc = doctors.find((d) => d._id === id);
    setFormState((p) => ({ ...p, doctorId: id, doctorName: doc?.name ?? "" }));
    setErrors((p) => ({ ...p, doctorId: "" }));
  };

  // ── Medicine helpers ──
  const setMedField = (
    idx: number,
    key: keyof MedicineForm,
    val: string | string[],
  ) => {
    setMedicines((p) =>
      p.map((m, i) => (i === idx ? { ...m, [key]: val } : m)),
    );
    setErrors((p) => ({ ...p, [`m_${idx}_${key}`]: "" }));
  };

  const toggleTime = (idx: number, time: string) => {
    const med = medicines[idx];
    const newTimes = med.times.includes(time)
      ? med.times.filter((t) => t !== time)
      : [...med.times, time];
    setMedField(idx, "times", newTimes);
  };

  const addMedicine = () => setMedicines((p) => [...p, { ...EMPTY_MEDICINE }]);
  const removeMedicine = (idx: number) =>
    setMedicines((p) => p.filter((_, i) => i !== idx));

  // ── Validation ──
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.patientName.trim()) e.patientName = "Patient name is required";
    if (!form.doctorId) e.doctorId = "Select a doctor";
    if (!form.diagnosis.trim()) e.diagnosis = "Diagnosis is required";
    medicines.forEach((m, i) => {
      if (!m.name.trim()) e[`m_${i}_name`] = "Required";
      if (!m.dosage.trim()) e[`m_${i}_dosage`] = "Required";
      if (!m.frequency.trim()) e[`m_${i}_frequency`] = "Required";
      if (!m.startDate) e[`m_${i}_startDate`] = "Required";
      if (m.times.length === 0) e[`m_${i}_times`] = "Select at least one time";
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
        scale: 1.5,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.85);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      pdf.addImage(imgData, "JPEG", 0, 0, pdfW, pdfH);
      return new File(
        [pdf.output("blob")],
        `NavhimPrescription_${Date.now()}.pdf`,
        { type: "application/pdf" },
      );
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
    showToast.success("Prescription PDF downloaded!");
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
      fd.append("diagnosis", form.diagnosis.trim());
      fd.append(
        "medicines",
        JSON.stringify(
          medicines.map((m) => ({
            name: m.name.trim(),
            dosage: m.dosage.trim(),
            frequency: m.frequency.trim(),
            times: m.times,
            startDate: m.startDate,
            ...(m.endDate ? { endDate: m.endDate } : {}),
          })),
        ),
      );
      fd.append("pdfKey", pdfFile);

      // Debug: FormData entries (console.log(fd) always looks empty — use this instead)
      if (import.meta.env.DEV) {
        console.log('[createPrescription] FormData entries:');
        for (const [key, val] of fd.entries()) {
          console.log(' ', key, ':', typeof val === 'string' ? val : `[File: ${(val as File).name}]`);
        }
      }
      const token = localStorage.getItem("jwt_token") ?? "";
      const baseURL = import.meta.env.VITE_API_URL ?? "";
      const response = await fetch(
        `${baseURL}/api/priscriptions/create-for-patient`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        },
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data?.message || `Server error ${response.status}`);

      showToast.success("Prescription created successfully!");
      navigate(-1);
    } catch (err: any) {
      showToast.error(err?.message || "Failed to submit prescription.");
    } finally {
      setLoading(false);
    }
  };

  // ── Derived ──
  const isBusy = loading || generating;
  const medCount = medicines.filter((m) => m.name).length;
  const completeness = calcPrescriptionCompleteness(
    form.patientName,
    form.doctorId,
    form.diagnosis,
    medCount,
  );

  return {
    form,
    medicines,
    errors,
    doctors,
    isBusy,
    generating,
    medCount,
    completeness,
    templateRef,
    setField,
    handleDoctorChange,
    setMedField,
    toggleTime,
    addMedicine,
    removeMedicine,
    handleDownloadPreview,
    handleSubmit,
  };
};
