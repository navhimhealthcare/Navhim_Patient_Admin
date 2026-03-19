/**
 * NavhimLabReportGenerator.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * Standalone lab-report generator for Navhim admin panel.
 *
 * Features
 *  • Real-time PDF preview (scales to fit the viewport)
 *  • Dynamic result rows (add / remove)
 *  • Quick-add common blood-test parameters
 *  • Generates a real PDF via html2canvas + jsPDF
 *  • Sends { ...payload, pdf: File } to POST /admin/create-for-patient
 *
 * Dependencies (add to package.json if missing):
 *   npm i jspdf html2canvas
 *
 * Usage in AppRoutes.jsx:
 *   <Route path="/app/patients/:patientId/create-report" element={<NavhimLabReportGenerator />} />
 *
 * Or open as a modal by importing and rendering conditionally.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate }                   from 'react-router-dom'
import jsPDF                                         from 'jspdf'
import html2canvas                                   from 'html2canvas'
import axiosInstance                                 from '../../../services/axiosConfig'
import showToast                                     from '../../../utils/toast'

// ── Types ─────────────────────────────────────────────────────────────────
interface ResultRow {
  name:        string
  value:       string
  normalRange: string
}

interface FormState {
  patientName: string   // display only – real patientId comes from route param
  doctorId:    string
  doctorName:  string
  testName:    string
  note:        string
  date:        string
}

interface Doctor { _id: string; name: string }

const today = new Date().toISOString().slice(0, 10)

const EMPTY_FORM: FormState = {
  patientName: '',
  doctorId:    '',
  doctorName:  '',
  testName:    '',
  note:        '',
  date:        today,
}

const QUICK_PARAMS: ResultRow[] = [
  { name: 'Hemoglobin',      value: '', normalRange: '13.0 - 17.0 g/dL'   },
  { name: 'WBC Count',       value: '', normalRange: '4.5 - 11.0 ×10³/μL' },
  { name: 'Platelets',       value: '', normalRange: '150 - 400 ×10³/μL'  },
  { name: 'RBC Count',       value: '', normalRange: '4.5 - 5.9 ×10⁶/μL'  },
  { name: 'Blood Sugar',     value: '', normalRange: '70 - 100 mg/dL'      },
  { name: 'Cholesterol',     value: '', normalRange: '< 200 mg/dL'         },
  { name: 'Creatinine',      value: '', normalRange: '0.7 - 1.3 mg/dL'     },
  { name: 'Potassium',       value: '', normalRange: '3.5 - 5.0 mEq/L'     },
]

// ── Helpers ───────────────────────────────────────────────────────────────
const isAbnormal = (r: ResultRow): boolean => {
  try {
    const val   = parseFloat(r.value)
    const match = r.normalRange.match(/([\d.]+)\s*[-–]\s*([\d.]+)/)
    if (!match || isNaN(val)) return false
    return val < parseFloat(match[1]) || val > parseFloat(match[2])
  } catch { return false }
}

const fmtDisplayDate = (iso: string) => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

// ── PDF Template ──────────────────────────────────────────────────────────
/**
 * This component renders EXACTLY what gets captured into the PDF.
 * Keep it at fixed A4 pixel dimensions (794 × 1123 px at 96dpi).
 * All styles are inline so html2canvas captures them correctly.
 */
function PdfTemplate({
  form, results, innerRef,
}: {
  form: FormState
  results: ResultRow[]
  innerRef: React.RefObject<HTMLDivElement>
}) {
  return (
    <div
      ref={innerRef}
      style={{
        width: '794px',
        minHeight: '1123px',
        background: '#ffffff',
        fontFamily: "'Segoe UI', Arial, sans-serif",
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        padding: '48px 56px',
      }}
    >
      {/* Watermark */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%) rotate(-35deg)',
        fontSize: '88px', fontWeight: 900,
        color: 'rgba(75,105,255,0.05)',
        letterSpacing: '4px', whiteSpace: 'nowrap',
        userSelect: 'none', pointerEvents: 'none',
        zIndex: 0,
      }}>
        NAVHIM LAB
      </div>

      {/* Content wrapper (above watermark) */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          {/* Logo area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #4B69FF 0%, #2D3F99 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 4C8.477 4 4 8.477 4 14s4.477 10 10 10 10-4.477 10-10S19.523 4 14 4z" fill="rgba(255,255,255,0.2)"/>
                <path d="M14 8v12M8 14h12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#10162F', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                NAVHIM DIAGNOSTIC CENTER
              </div>
              <div style={{ fontSize: '12px', color: '#4B69FF', fontWeight: 600, letterSpacing: '2px', marginTop: '2px' }}>
                LAB REPORT
              </div>
            </div>
          </div>

          {/* Date + meta block */}
          <div style={{ textAlign: 'right', fontSize: '12px', color: '#666', lineHeight: 1.8 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#10162F' }}>
              Date: {fmtDisplayDate(form.date)}
            </div>
            <div>Patient Name: <span style={{ fontWeight: 600, color: '#10162F' }}>{form.patientName || <span style={{ color: '#ccc' }}>—</span>}</span></div>
            <div>Doctor Name: <span style={{ fontWeight: 600, color: '#10162F' }}>{form.doctorName || <span style={{ color: '#ccc' }}>—</span>}</span></div>
            <div>Test Name: <span style={{ fontWeight: 600, color: '#10162F' }}>{form.testName || <span style={{ color: '#ccc' }}>—</span>}</span></div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #4B69FF 0%, #2D3F99 100%)', borderRadius: '2px', marginBottom: '32px' }} />

        {/* ── Results table ── */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#4B69FF', marginBottom: '14px', letterSpacing: '-0.2px' }}>
            Test Results
          </div>

          {/* Table head */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            borderBottom: '2px solid #10162F',
            paddingBottom: '8px',
            marginBottom: '4px',
          }}>
            {['Test', 'Result', 'Normal Range'].map(h => (
              <div key={h} style={{ fontSize: '12px', fontWeight: 700, color: '#10162F', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                {h}
              </div>
            ))}
          </div>

          {/* Table rows */}
          {results.length === 0 ? (
            <div style={{ padding: '16px 0', fontSize: '12px', color: '#ccc', textAlign: 'center' }}>
              No parameters added yet
            </div>
          ) : results.map((r, i) => {
            const abnormal = isAbnormal(r)
            return (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                borderBottom: '1px solid #f0f0f0',
                padding: '10px 0',
                background: i % 2 === 1 ? '#fafbff' : 'transparent',
              }}>
                <div style={{ fontSize: '13px', color: '#333', fontWeight: 500 }}>{r.name || '—'}</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: abnormal ? '#DC2626' : '#16a34a' }}>
                  {r.value || '—'}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>{r.normalRange || '—'}</div>
              </div>
            )
          })}
        </div>

        {/* ── Doctor's Note ── */}
        {form.note && (
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#4B69FF', minWidth: '110px' }}>
                Doctor's Note:
              </div>
              <div style={{ fontSize: '13px', color: '#444', lineHeight: 1.6 }}>
                {form.note}
              </div>
            </div>
          </div>
        )}

        {/* ── Signature area ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '48px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '140px', height: '50px',
              borderBottom: '1.5px solid #10162F',
              marginBottom: '6px',
            }} />
            <div style={{ fontSize: '11px', color: '#666', letterSpacing: '0.5px' }}>Authorized Signature</div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          marginTop: '60px',
          paddingTop: '16px',
          borderTop: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: '10px', color: '#aaa', lineHeight: 1.7 }}>
            <div>This is a digitally generated report.</div>
            <div>For verification, scan QR code.</div>
          </div>
          {/* Simple QR placeholder box */}
          <div style={{
            width: '56px', height: '56px',
            border: '2px solid #eee',
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '8px', color: '#ccc', textAlign: 'center',
          }}>
            QR
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────
export default function NavhimLabReportGenerator() {
  const { patientId } = useParams<{ patientId: string }>()
  const navigate      = useNavigate()

  const [form,      setForm]      = useState<FormState>(EMPTY_FORM)
  const [results,   setResults]   = useState<ResultRow[]>([{ name: '', value: '', normalRange: '' }])
  const [errors,    setErrors]    = useState<Record<string, string>>({})
  const [doctors,   setDoctors]   = useState<Doctor[]>([])
  const [loading,   setLoading]   = useState(false)
  const [generating, setGenerating] = useState(false)

  const templateRef = useRef<HTMLDivElement>(null)

  // Fetch doctors
  useEffect(() => {
    axiosInstance.get('/doctors')
      .then(res => {
        const list = res.data?.data ?? res.data ?? []
        setDoctors(list.map((d: any) => ({ _id: d._id, name: d.name })))
      })
      .catch(() => {})
  }, [])

  // ── Form helpers ──
  const setField = (key: keyof FormState, val: string) => {
    setForm(p => ({ ...p, [key]: val }))
    setErrors(p => ({ ...p, [key]: '' }))
  }

  const setResult = (idx: number, key: keyof ResultRow, val: string) => {
    setResults(p => p.map((r, i) => i === idx ? { ...r, [key]: val } : r))
    setErrors(p => ({ ...p, [`r_${idx}_${key}`]: '' }))
  }

  const addRow    = () => setResults(p => [...p, { name: '', value: '', normalRange: '' }])
  const removeRow = (idx: number) => setResults(p => p.filter((_, i) => i !== idx))
  const addQuick  = (preset: ResultRow) =>
    setResults(p => [...p.filter(r => r.name || r.value), { ...preset }])

  const handleDoctorChange = (id: string) => {
    const doc = doctors.find(d => d._id === id)
    setForm(p => ({ ...p, doctorId: id, doctorName: doc?.name ?? '' }))
    setErrors(p => ({ ...p, doctorId: '' }))
  }

  // ── Validation ──
  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.doctorId)        e.doctorId = 'Select a doctor'
    if (!form.testName.trim()) e.testName = 'Test name is required'
    if (!form.patientName.trim()) e.patientName = 'Patient name is required'
    results.forEach((r, i) => {
      if (!r.name.trim())  e[`r_${i}_name`]  = 'Required'
      if (!r.value.trim()) e[`r_${i}_value`] = 'Required'
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Generate PDF blob from template ──
  const generatePdfBlob = useCallback(async (): Promise<File | null> => {
    if (!templateRef.current) return null
    setGenerating(true)
    try {
      const canvas = await html2canvas(templateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pdfW    = pdf.internal.pageSize.getWidth()
      const pdfH    = (canvas.height * pdfW) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH)
      const blob = pdf.output('blob')
      return new File([blob], `NavhimReport_${Date.now()}.pdf`, { type: 'application/pdf' })
    } finally {
      setGenerating(false)
    }
  }, [])

  // ── Download preview PDF ──
  const handleDownloadPreview = async () => {
    const file = await generatePdfBlob()
    if (!file) return
    const url = URL.createObjectURL(file)
    const a   = document.createElement('a')
    a.href = url; a.download = file.name; a.click()
    URL.revokeObjectURL(url)
    showToast.success('PDF downloaded!')
  }

  // ── Submit ──
  const handleSubmit = async () => {
    if (!validate()) {
      showToast.warn('Please fix the errors before submitting.')
      return
    }
    setLoading(true)
    try {
      // 1. Generate PDF
      const pdfFile = await generatePdfBlob()
      if (!pdfFile) throw new Error('PDF generation failed')

      // 2. Build FormData (multipart — includes PDF file)
      const fd = new FormData()
      fd.append('patientId', patientId ?? '')
      fd.append('doctorId',  form.doctorId)
      fd.append('testName',  form.testName.trim())
      fd.append('note',      form.note.trim())
      fd.append('results',   JSON.stringify(
        results.map(r => ({
          name:        r.name.trim(),
          value:       r.value.trim(),
          normalRange: r.normalRange.trim(),
        }))
      ))
      fd.append('pdf', pdfFile, pdfFile.name)

      await axiosInstance.post('/admin/create-for-patient', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      showToast.success('Report created and PDF uploaded!')
      navigate(-1)
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Failed to submit report.')
    } finally {
      setLoading(false)
    }
  }

  // ── UI ────────────────────────────────────────────────────────────────
  const isBusy = loading || generating

  return (
    <div className="flex flex-col gap-0 pb-6">

      {/* ══ PAGE HEADER ══ */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-navy hover:border-gray-300 transition-all">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div>
            <h1 className="font-poppins font-black text-[28px] text-navy tracking-tight leading-none">
              Create Lab Report
            </h1>
            <p className="text-[13px] text-gray-400 mt-1">
              Fill in details — the PDF preview updates live as you type
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleDownloadPreview} disabled={isBusy}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-[13px] font-semibold text-gray-500 hover:text-navy hover:border-gray-300 hover:shadow-sm transition-all disabled:opacity-50">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Preview PDF
          </button>
          <button onClick={handleSubmit} disabled={isBusy}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-brand-primary to-brand-gradient text-white text-[13.5px] font-bold shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0">
            {isBusy ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M12 7A5 5 0 112 7" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                {generating ? 'Generating PDF…' : 'Submitting…'}
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7l4 4 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Submit Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* ══ MAIN SPLIT LAYOUT ══ */}
      <div className="grid gap-5" style={{ gridTemplateColumns: '420px 1fr' }}>

        {/* ── LEFT: Form panel ── */}
        <div className="flex flex-col gap-4">

          {/* Report Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-brand-lighter flex items-center justify-center">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <rect x="2" y="1" width="10" height="12" rx="1.5" stroke="#4B69FF" strokeWidth="1.3"/>
                  <path d="M4.5 5h5M4.5 7.5h5M4.5 10h3" stroke="#4B69FF" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-[13px] font-bold text-navy">Report Information</p>
            </div>

            {/* Patient name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-navy">Patient Name <span className="text-red-400">*</span></label>
              <input value={form.patientName}
                onChange={e => setField('patientName', e.target.value)}
                placeholder="Enter patient name"
                className={`h-10 px-3 rounded-xl border text-[13px] font-medium text-navy placeholder:text-gray-300 outline-none transition-all
                  ${errors.patientName ? 'border-red-300 bg-red-50 focus:border-red-400' : 'border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10'}`}
              />
              {errors.patientName && <p className="text-[11px] text-red-500">{errors.patientName}</p>}
            </div>

            {/* Doctor */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-navy">Doctor <span className="text-red-400">*</span></label>
              <div className="relative">
                <select value={form.doctorId} onChange={e => handleDoctorChange(e.target.value)}
                  className={`w-full h-10 pl-3 pr-8 rounded-xl border text-[13px] font-medium appearance-none outline-none transition-all bg-white cursor-pointer
                    ${errors.doctorId ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10'}
                    ${!form.doctorId ? 'text-gray-400' : 'text-navy'}`}>
                  <option value="" disabled>Select doctor</option>
                  {doctors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {errors.doctorId && <p className="text-[11px] text-red-500">{errors.doctorId}</p>}
            </div>

            {/* Test name + Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-navy">Test Name <span className="text-red-400">*</span></label>
                <input value={form.testName}
                  onChange={e => setField('testName', e.target.value)}
                  placeholder="e.g. Complete Blood Count"
                  className={`h-10 px-3 rounded-xl border text-[13px] font-medium text-navy placeholder:text-gray-300 outline-none transition-all
                    ${errors.testName ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10'}`}
                />
                {errors.testName && <p className="text-[11px] text-red-500">{errors.testName}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-navy">Date</label>
                <input type="date" value={form.date}
                  onChange={e => setField('date', e.target.value)}
                  className="h-10 px-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 text-[13px] font-medium text-navy outline-none transition-all cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Parameters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <path d="M5 2v5l-2.5 5h9L9 7V2M4 2h6" stroke="#2563EB" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-[13px] font-bold text-navy">Parameters <span className="text-red-400">*</span></p>
              </div>
              <button type="button" onClick={addRow}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-lighter text-brand-primary text-[11.5px] font-bold hover:bg-brand-soft transition-colors">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Add Row
              </button>
            </div>

            {/* Column labels */}
            <div className="grid gap-2 px-1" style={{ gridTemplateColumns: '1fr 1fr 1fr 28px' }}>
              {['Parameter', 'Value', 'Range', ''].map(h => (
                <p key={h} className="text-[9.5px] font-black uppercase tracking-widest text-gray-300">{h}</p>
              ))}
            </div>

            {/* Rows */}
            <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
              {results.map((row, idx) => (
                <div key={idx} className="grid gap-2 items-start" style={{ gridTemplateColumns: '1fr 1fr 1fr 28px' }}>
                  <div>
                    <input value={row.name} onChange={e => setResult(idx, 'name', e.target.value)}
                      placeholder="Hemoglobin"
                      className={`w-full h-9 px-2.5 rounded-lg border text-[12px] font-medium text-navy placeholder:text-gray-300 outline-none transition-all
                        ${errors[`r_${idx}_name`] ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10'}`}
                    />
                    {errors[`r_${idx}_name`] && <p className="text-[10px] text-red-500 mt-0.5">{errors[`r_${idx}_name`]}</p>}
                  </div>
                  <div>
                    <input value={row.value} onChange={e => setResult(idx, 'value', e.target.value)}
                      placeholder="13.5 g/dL"
                      className={`w-full h-9 px-2.5 rounded-lg border text-[12px] font-medium text-navy placeholder:text-gray-300 outline-none transition-all
                        ${errors[`r_${idx}_value`] ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10'}`}
                    />
                    {errors[`r_${idx}_value`] && <p className="text-[10px] text-red-500 mt-0.5">{errors[`r_${idx}_value`]}</p>}
                  </div>
                  <input value={row.normalRange} onChange={e => setResult(idx, 'normalRange', e.target.value)}
                    placeholder="13.0-17.0 g/dL"
                    className="w-full h-9 px-2.5 rounded-lg border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 text-[12px] font-medium text-navy placeholder:text-gray-300 outline-none transition-all"
                  />
                  <button type="button" onClick={() => results.length > 1 && removeRow(idx)}
                    disabled={results.length === 1}
                    className="w-7 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 hover:border-red-100 disabled:opacity-25 disabled:cursor-not-allowed transition-all flex-shrink-0">
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M1.5 5.5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Quick add */}
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-50">
              <span className="text-[10px] font-bold text-gray-300 self-center">Quick:</span>
              {QUICK_PARAMS.map(p => (
                <button key={p.name} type="button" onClick={() => addQuick(p)}
                  className="text-[10.5px] font-semibold text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-lg hover:bg-brand-lighter hover:text-brand-primary hover:border-brand-primary/20 transition-all">
                  +{p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="#D97706" strokeWidth="1.3"/>
                  <path d="M7 4.5v3.5M7 9.5v.5" stroke="#D97706" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-[13px] font-bold text-navy">Doctor's Note <span className="text-[11px] text-gray-300 font-normal">(optional)</span></p>
            </div>
            <textarea value={form.note} onChange={e => setField('note', e.target.value)}
              placeholder="e.g. Patient should repeat test after 2 weeks…"
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 text-[12.5px] font-medium text-navy placeholder:text-gray-300 outline-none resize-none transition-all"
            />
          </div>
        </div>

        {/* ── RIGHT: Live PDF preview ── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[12.5px] font-bold text-gray-500">Live Preview</p>
            </div>
            <p className="text-[11px] text-gray-300">Reflects your changes in real-time</p>
          </div>

          {/* Preview container — scrollable, scales PDF template down */}
          <div className="bg-gray-100 rounded-2xl border border-gray-200 overflow-auto flex-1 p-4"
            style={{ minHeight: '600px' }}>
            <div style={{ transform: 'scale(0.72)', transformOrigin: 'top left', width: '794px' }}>
              <PdfTemplate form={form} results={results} innerRef={templateRef} />
            </div>
          </div>

          {/* Info strip */}
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-4 text-[11.5px] text-gray-400">
              <span><span className="font-bold text-navy">{results.filter(r => r.name).length}</span> parameter{results.filter(r => r.name).length !== 1 ? 's' : ''}</span>
              <span>·</span>
              <span><span className="font-bold text-red-500">{results.filter(r => r.name && isAbnormal(r)).length}</span> abnormal</span>
              <span>·</span>
              <span>A4 PDF · auto-generated</span>
            </div>
            <span className="text-[10.5px] text-gray-300 font-mono">
              {patientId?.slice(-8)}
            </span>
          </div>
        </div>
      </div>

      {/* Hidden full-size template (captured by html2canvas) */}
      <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', zIndex: -1, pointerEvents: 'none' }}>
        <PdfTemplate form={form} results={results} innerRef={templateRef} />
      </div>
    </div>
  )
}
