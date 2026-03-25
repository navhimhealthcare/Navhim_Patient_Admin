import appLogo from '../../../assets/images/appLogo.png'
import { PrescriptionForm, MedicineForm } from '../types/prescription.types'
import { fmtShortDate } from '../utils/prescriptionUtils'

interface Props {
  form:      PrescriptionForm
  medicines: MedicineForm[]
  innerRef:  React.RefObject<HTMLDivElement>
}

export default function PrescriptionPdfTemplate({ form, medicines, innerRef }: Props) {
  const filledMeds = medicines.filter(m => m.name)

  return (
    <div ref={innerRef} style={{
      width: '794px', minHeight: '1123px',
      background: '#f5f7fb',
      fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
      position: 'relative', overflow: 'hidden',
      boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
    }}>

      {/* ── HEADER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f1f5c 0%, #1a3499 55%, #2d3f99 100%)',
        padding: '28px 48px 26px', position: 'relative', overflow: 'hidden', flexShrink: 0,
      }}>
        <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', right: '80px', top: '20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '58px', height: '58px', borderRadius: '15px',
              background: 'rgba(255,255,255,0.13)', border: '1.5px solid rgba(255,255,255,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            }}>
              <img src={appLogo} alt="Navhim" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontSize: '21px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
                NAVHIM DIAGNOSTIC CENTER
              </div>
              <div style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.5)', fontWeight: 500, letterSpacing: '2.5px', marginTop: '5px' }}>
                PATHOLOGY  ·  RADIOLOGY  ·  LAB SERVICES
              </div>
            </div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.18)',
            borderRadius: '12px', padding: '12px 22px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '8.5px', color: 'rgba(255,255,255,0.45)', letterSpacing: '2.5px', fontWeight: 700, marginBottom: '5px' }}>
              DOCUMENT TYPE
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', letterSpacing: '1.5px' }}>
              PRESCRIPTION
            </div>
          </div>
        </div>
      </div>

      {/* ── PATIENT / DOCTOR STRIP ── */}
      <div style={{
        background: '#ffffff', borderBottom: '1px solid #e2e6f0',
        padding: '0 48px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', flexShrink: 0,
      }}>
        {[
          { label: 'PATIENT NAME',     value: form.patientName || '—' },
          { label: 'PRESCRIBING DOCTOR', value: form.doctorName  || '—' },
          { label: 'DIAGNOSIS',        value: form.diagnosis   || '—' },
          { label: 'PRESCRIPTION DATE', value: fmtShortDate(form.date) || '—' },
        ].map((item, i) => (
          <div key={i} style={{
            padding: '14px 0', paddingLeft: i === 0 ? '0' : '20px', paddingRight: '20px',
            borderLeft: i === 0 ? 'none' : '1px solid #e2e6f0',
          }}>
            <div style={{ fontSize: '8px', fontWeight: 700, color: '#9ca3af', letterSpacing: '1.5px', marginBottom: '5px' }}>
              {item.label}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#10162F', lineHeight: 1.2 }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── BODY ── */}
      <div style={{ padding: '26px 48px 80px', flex: 1 }}>

        {/* Summary pill */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#eef1ff', border: '1px solid #c7d2fe', borderRadius: '8px', padding: '7px 13px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4B69FF' }} />
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#3730a3' }}>
              {filledMeds.length} Medicine{filledMeds.length !== 1 ? 's' : ''} Prescribed
            </span>
          </div>
        </div>

        {/* Section heading */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{ width: '3px', height: '16px', background: 'linear-gradient(180deg, #4B69FF, #2D3F99)', borderRadius: '2px' }} />
          <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#10162F', letterSpacing: '1px' }}>PRESCRIBED MEDICINES</div>
        </div>

        {/* Medicines table */}
        <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e6f0', overflow: 'hidden', marginBottom: '24px' }}>
          {/* Head */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1.5fr 0.8fr 1.2fr 1fr 1fr 1fr',
            background: '#f1f4ff', borderBottom: '1.5px solid #dde3f8', padding: '10px 18px',
          }}>
            {['Medicine', 'Dosage', 'Frequency', 'Timing', 'Start Date', 'End Date'].map(h => (
              <div key={h} style={{ fontSize: '9px', fontWeight: 800, color: '#6b7280', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          {filledMeds.length === 0 ? (
            <div style={{ padding: '24px', fontSize: '12px', color: '#d1d5db', textAlign: 'center' }}>
              No medicines added yet
            </div>
          ) : filledMeds.map((m, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1.5fr 0.8fr 1.2fr 1fr 1fr 1fr',
              padding: '12px 18px',
              borderBottom: i < filledMeds.length - 1 ? '1px solid #f3f4f6' : 'none',
              background: i % 2 === 0 ? '#ffffff' : '#fafbff',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#10162F' }}>{m.name}</div>
              </div>
              <div style={{ fontSize: '12px', color: '#374151', fontWeight: 600 }}>{m.dosage || '—'}</div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>{m.frequency || '—'}</div>
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                  {m.times.map(t => (
                    <span key={t} style={{
                      display: 'inline-block', padding: '2px 6px', borderRadius: '10px',
                      fontSize: '9px', fontWeight: 700,
                      background: '#eef1ff', color: '#4B69FF', border: '1px solid #c7d2fe',
                      textTransform: 'capitalize',
                    }}>{t}</span>
                  ))}
                  {m.times.length === 0 && <span style={{ fontSize: '11px', color: '#d1d5db' }}>—</span>}
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#374151' }}>{fmtShortDate(m.startDate) || '—'}</div>
              <div style={{ fontSize: '11px', color: '#374151' }}>{m.endDate ? fmtShortDate(m.endDate) : <span style={{ color: '#d1d5db' }}>Ongoing</span>}</div>
            </div>
          ))}
        </div>

        {/* Instructions note */}
        <div style={{
          background: '#fffdf0', border: '1px solid #fde68a', borderLeft: '4px solid #f59e0b',
          borderRadius: '8px', padding: '14px 18px', marginBottom: '28px',
        }}>
          <div style={{ fontSize: '9px', fontWeight: 800, color: '#92400e', letterSpacing: '1px', marginBottom: '5px' }}>
            GENERAL INSTRUCTIONS
          </div>
          <div style={{ fontSize: '11.5px', color: '#78350f', lineHeight: 1.8 }}>
            • Take medicines as prescribed. Do not skip doses.<br/>
            • Complete the full course even if symptoms improve.<br/>
            • Contact your doctor if you experience any adverse reactions.<br/>
            • Store medicines in a cool, dry place away from sunlight.
          </div>
        </div>

        {/* Signature */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          paddingTop: '20px', borderTop: '1.5px solid #e2e6f0',
        }}>
          <div style={{ maxWidth: '340px' }}>
            <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#9ca3af', letterSpacing: '1px', marginBottom: '5px' }}>DISCLAIMER</div>
            <div style={{ fontSize: '9px', color: '#b0b7c3', lineHeight: 1.9 }}>
              This prescription is confidential and intended solely for the named patient.<br/>
              Dispensed only on production of this document. Digitally generated by Navhim.
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            {/* <div style={{
              width: '164px', borderBottom: '1.5px solid #374151',
              marginBottom: '7px', height: '42px',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '4px',
            }} /> */}
            <div style={{ fontSize: '10px', color: '#374151', fontWeight: 700 }}>{form.doctorName || '————————'}</div>
            <div style={{ fontSize: '9px', color: '#9ca3af', marginTop: '2px' }}>Navhim Diagnostic Center</div>
          </div>
        </div>
      </div>

      {/* ── FOOTER BAND ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(135deg, #0f1f5c 0%, #2d3f99 100%)',
        padding: '10px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: '8.5px', color: 'rgba(255,255,255,0.4)' }}>
          © Navhim Diagnostic Center · Confidential Medical Document
        </div>
        <div style={{ fontSize: '8.5px', color: 'rgba(255,255,255,0.4)' }}>
          Date: {fmtShortDate(form.date)}
        </div>
      </div>
    </div>
  )
}
