import { useState, useEffect } from 'react'
import { CreateReportPayload, CreateReportResultForm } from '../types/report.types'
import Button from '../../../components/Button/Button'
import Input  from '../../../components/Input/Input'

// ── Types ─────────────────────────────────────────────────────────────────
interface Props {
  open:      boolean
  patientId: string
  doctors:   { _id: string; name: string }[]
  loading:   boolean
  onClose:   () => void
  onSubmit:  (payload: CreateReportPayload) => Promise<boolean>
}

interface FormState {
  doctorId: string
  testName: string
  note:     string
}

const EMPTY_FORM: FormState = { doctorId: '', testName: '', note: '' }
const EMPTY_ROW: CreateReportResultForm = { name: '', value: '', normalRange: '' }

// ── Modal ─────────────────────────────────────────────────────────────────
export default function CreateReportModal({ open, patientId, doctors, loading, onClose, onSubmit }: Props) {
  const [form,    setForm]    = useState<FormState>(EMPTY_FORM)
  const [results, setResults] = useState<CreateReportResultForm[]>([{ ...EMPTY_ROW }])
  const [errors,  setErrors]  = useState<Record<string, string>>({})

  // Reset on open
  useEffect(() => {
    if (open) { setForm(EMPTY_FORM); setResults([{ ...EMPTY_ROW }]); setErrors({}) }
  }, [open])

  if (!open) return null

  // ── Form helpers ──
  const setField = (key: keyof FormState, val: string) => {
    setForm(p => ({ ...p, [key]: val }))
    setErrors(p => ({ ...p, [key]: '' }))
  }

  const setResultField = (idx: number, key: keyof CreateReportResultForm, val: string) => {
    setResults(prev => prev.map((r, i) => i === idx ? { ...r, [key]: val } : r))
    setErrors(p => ({ ...p, [`result_${idx}_${key}`]: '' }))
  }

  const addRow    = () => setResults(p => [...p, { ...EMPTY_ROW }])
  const removeRow = (idx: number) => setResults(p => p.filter((_, i) => i !== idx))

  // ── Validation ──
  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.doctorId)      e.doctorId = 'Please select a doctor'
    if (!form.testName.trim()) e.testName = 'Test name is required'
    results.forEach((r, i) => {
      if (!r.name.trim())  e[`result_${i}_name`]  = 'Required'
      if (!r.value.trim()) e[`result_${i}_value`] = 'Required'
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    const payload: CreateReportPayload = {
      patientId,
      doctorId:  form.doctorId,
      testName:  form.testName.trim(),
      results:   results.map(r => ({
        name:        r.name.trim(),
        value:       r.value.trim(),
        normalRange: r.normalRange.trim(),
      })),
      note: form.note.trim(),
    }
    const ok = await onSubmit(payload)
    if (ok) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-navy/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-[fadeUp_0.25s_ease_both]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-lighter flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="2" width="14" height="16" rx="2" stroke="#4B69FF" strokeWidth="1.5"/>
                <path d="M7 7h6M7 10h6M7 13h4" stroke="#4B69FF" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="15.5" cy="15.5" r="3.5" fill="#4B69FF"/>
                <path d="M14.5 15.5h2M15.5 14.5v2" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h2 className="font-poppins font-bold text-[16px] text-navy">Add Report</h2>
              <p className="text-[11.5px] text-gray-400 mt-0.5">Create a new lab report for this patient</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-navy hover:border-gray-300 transition-all">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden" noValidate>
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

            {/* Row 1: Doctor + Test Name */}
            <div className="grid grid-cols-2 gap-4">
              {/* Doctor select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12.5px] font-semibold text-navy">Doctor <span className="text-red-400">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base pointer-events-none">🩺</span>
                  <select value={form.doctorId} onChange={e => setField('doctorId', e.target.value)}
                    className={`w-full h-11 pl-10 pr-9 rounded-xl border text-[13px] font-medium appearance-none outline-none transition-all bg-white cursor-pointer
                      ${errors.doctorId ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10'}
                      ${!form.doctorId ? 'text-gray-400' : 'text-navy'}`}>
                    <option value="" disabled>Select doctor</option>
                    {doctors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {errors.doctorId && <p className="text-[11.5px] text-red-500 font-medium">{errors.doctorId}</p>}
              </div>

              <Input label={<>Test Name <span className="text-red-400">*</span></>}
                name="testName" type="text"
                placeholder="e.g. Complete Blood Count"
                value={form.testName}
                onChange={e => setField('testName', e.target.value)}
                icon="🧪"
                error={errors.testName}
              />
            </div>

            {/* Results section */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-bold text-navy">Test Parameters <span className="text-red-400">*</span></p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Add each parameter name, measured value, and normal range</p>
                </div>
                <button type="button" onClick={addRow}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-lighter text-brand-primary text-[12px] font-bold hover:bg-brand-soft transition-colors">
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                  Add Row
                </button>
              </div>

              {/* Column headers */}
              <div className="grid gap-2" style={{ gridTemplateColumns: '1fr 1fr 1fr 32px' }}>
                {['Parameter Name', 'Value', 'Normal Range', ''].map(h => (
                  <p key={h} className="text-[10.5px] font-black uppercase tracking-widest text-gray-300 px-1">{h}</p>
                ))}
              </div>

              {/* Result rows */}
              <div className="flex flex-col gap-2">
                {results.map((row, idx) => (
                  <div key={idx} className="grid gap-2 items-start" style={{ gridTemplateColumns: '1fr 1fr 1fr 32px' }}>
                    {/* Name */}
                    <div>
                      <input value={row.name}
                        onChange={e => setResultField(idx, 'name', e.target.value)}
                        placeholder="e.g. Hemoglobin"
                        className={`w-full h-10 px-3 rounded-xl border text-[12.5px] font-medium text-navy placeholder:text-gray-300 outline-none transition-all
                          ${errors[`result_${idx}_name`] ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10'}`}
                      />
                      {errors[`result_${idx}_name`] && <p className="text-[10.5px] text-red-500 mt-0.5 px-1">{errors[`result_${idx}_name`]}</p>}
                    </div>
                    {/* Value */}
                    <div>
                      <input value={row.value}
                        onChange={e => setResultField(idx, 'value', e.target.value)}
                        placeholder="e.g. 13.5 g/dL"
                        className={`w-full h-10 px-3 rounded-xl border text-[12.5px] font-medium text-navy placeholder:text-gray-300 outline-none transition-all
                          ${errors[`result_${idx}_value`] ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10'}`}
                      />
                      {errors[`result_${idx}_value`] && <p className="text-[10.5px] text-red-500 mt-0.5 px-1">{errors[`result_${idx}_value`]}</p>}
                    </div>
                    {/* Normal Range */}
                    <input value={row.normalRange}
                      onChange={e => setResultField(idx, 'normalRange', e.target.value)}
                      placeholder="e.g. 13.0 - 17.0 g/dL"
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 text-[12.5px] font-medium text-navy placeholder:text-gray-300 outline-none transition-all"
                    />
                    {/* Remove row */}
                    <button type="button"
                      onClick={() => results.length > 1 && removeRow(idx)}
                      disabled={results.length === 1}
                      className="w-8 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 hover:border-red-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex-shrink-0">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Quick add common tests */}
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <span className="text-[11px] text-gray-300 font-semibold">Quick add:</span>
                {[
                  { name: 'Hemoglobin',   normalRange: '13.0 - 17.0 g/dL' },
                  { name: 'WBC Count',    normalRange: '4.5 - 11.0 ×10³/μL' },
                  { name: 'Platelets',    normalRange: '150 - 400 ×10³/μL' },
                  { name: 'Blood Sugar',  normalRange: '70 - 100 mg/dL' },
                  { name: 'Cholesterol',  normalRange: '< 200 mg/dL' },
                ].map(preset => (
                  <button key={preset.name} type="button"
                    onClick={() => setResults(p => [...p, { name: preset.name, value: '', normalRange: preset.normalRange }])}
                    className="text-[11px] font-semibold text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg hover:bg-brand-lighter hover:text-brand-primary hover:border-brand-primary/20 transition-all">
                    + {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Doctor's Note */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold text-navy">Doctor's Note <span className="text-gray-300 font-normal">(optional)</span></label>
              <textarea value={form.note}
                onChange={e => setField('note', e.target.value)}
                placeholder="e.g. Patient should repeat test after 2 weeks…"
                rows={3}
                className="w-full px-3.5 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 text-[12.5px] font-medium text-navy placeholder:text-gray-300 outline-none resize-none transition-all"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-gray-50/50">
            <p className="text-[11.5px] text-gray-400">
              <span className="font-bold text-navy">{results.length}</span> parameter{results.length !== 1 ? 's' : ''} added
            </p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-500 hover:bg-gray-50 hover:text-navy transition-all">
                Cancel
              </button>
              <Button type="submit" loading={loading} className="justify-center px-7">
                Create Report
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
