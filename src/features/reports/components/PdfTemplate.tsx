// import appLogo from "../../../assets/images/appLogo.png";
// import { FormState, ResultRow } from "../types/labReport.types";
// import { isAbnormal, fmtDisplayDate } from "../utils/helpers";

// interface Props {
//   form: FormState;
//   results: ResultRow[];
//   signature: string | null;
//   innerRef: React.RefObject<HTMLDivElement>;
// }

// export default function PdfTemplate({
//   form,
//   results,
//   signature,
//   innerRef,
// }: Props) {
//   return (
//     <div
//       ref={innerRef}
//       style={{
//         width: "794px",
//         minHeight: "1123px",
//         background: "#ffffff",
//         fontFamily: "'Segoe UI', Arial, sans-serif",
//         position: "relative",
//         overflow: "hidden",
//         boxSizing: "border-box",
//         padding: "48px 56px",
//       }}
//     >
//       {/* Watermark */}
//       <div
//         style={{
//           position: "absolute",
//           top: "50%",
//           left: "50%",
//           transform: "translate(-50%, -50%) rotate(-35deg)",
//           fontSize: "88px",
//           fontWeight: 900,
//           color: "rgba(75,105,255,0.05)",
//           letterSpacing: "4px",
//           whiteSpace: "nowrap",
//           userSelect: "none",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       >
//         NAVHIM LAB
//       </div>

//       <div style={{ position: "relative", zIndex: 1 }}>
//         {/* Header */}
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             marginBottom: "28px",
//           }}
//         >
//           <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
//             <img
//               src={appLogo}
//               alt="Navhim Logo"
//               style={{ width: "52px", height: "52px", borderRadius: "20%" }}
//             />
//             <div>
//               <div
//                 style={{
//                   fontSize: "22px",
//                   fontWeight: 800,
//                   color: "#10162F",
//                   letterSpacing: "-0.5px",
//                   lineHeight: 1.1,
//                 }}
//               >
//                 NAVHIM DIAGNOSTIC CENTER
//               </div>
//               <div
//                 style={{
//                   fontSize: "12px",
//                   color: "#4B69FF",
//                   fontWeight: 600,
//                   letterSpacing: "1px",
//                   marginTop: "2px",
//                 }}
//               >
//                 LAB REPORT
//               </div>
//             </div>
//           </div>
//           <div
//             style={{
//               textAlign: "right",
//               fontSize: "12px",
//               color: "#666",
//               lineHeight: 1.8,
//               marginTop: "20px",
//             }}
//           >
//             <div
//               style={{ fontSize: "13px", fontWeight: 700, color: "#10162F" }}
//             >
//               Date: {fmtDisplayDate(form.date)}
//             </div>
//             <div>
//               Patient Name:{" "}
//               <span style={{ fontWeight: 600, color: "#10162F" }}>
//                 {form.patientName || "—"}
//               </span>
//             </div>
//             <div>
//               Doctor Name:{" "}
//               <span style={{ fontWeight: 600, color: "#10162F" }}>
//                 {form.doctorName || "—"}
//               </span>
//             </div>
//             <div>
//               Test Name:{" "}
//               <span style={{ fontWeight: 600, color: "#10162F" }}>
//                 {form.testName || "—"}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Gradient divider */}
//         <div
//           style={{
//             height: "2px",
//             background: "linear-gradient(90deg, #4B69FF 0%, #2D3F99 100%)",
//             borderRadius: "2px",
//             marginBottom: "32px",
//           }}
//         />

//         {/* Results table */}
//         <div style={{ marginBottom: "28px" }}>
//           <div
//             style={{
//               fontSize: "16px",
//               fontWeight: 700,
//               color: "#4B69FF",
//               marginBottom: "14px",
//             }}
//           >
//             Test Results
//           </div>
//           {/* Table head */}
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "1fr 1fr 1fr",
//               borderBottom: "2px solid #10162F",
//               paddingBottom: "8px",
//               marginBottom: "4px",
//             }}
//           >
//             {["Test", "Result", "Normal Range"].map((h) => (
//               <div
//                 key={h}
//                 style={{
//                   fontSize: "12px",
//                   fontWeight: 700,
//                   color: "#10162F",
//                   textTransform: "uppercase",
//                   letterSpacing: "0.8px",
//                 }}
//               >
//                 {h}
//               </div>
//             ))}
//           </div>
//           {/* Rows */}
//           {results.length === 0 ? (
//             <div
//               style={{
//                 padding: "16px 0",
//                 fontSize: "12px",
//                 color: "#ccc",
//                 textAlign: "center",
//               }}
//             >
//               No parameters added yet
//             </div>
//           ) : (
//             results.map((r, i) => {
//               const ab = isAbnormal(r);
//               return (
//                 <div
//                   key={i}
//                   style={{
//                     display: "grid",
//                     gridTemplateColumns: "1fr 1fr 1fr",
//                     borderBottom: "1px solid #f0f0f0",
//                     padding: "10px 0",
//                     background: i % 2 === 1 ? "#fafbff" : "transparent",
//                   }}
//                 >
//                   <div
//                     style={{ fontSize: "13px", color: "#333", fontWeight: 500 }}
//                   >
//                     {r.name || "—"}
//                   </div>
//                   <div
//                     style={{
//                       fontSize: "13px",
//                       fontWeight: 700,
//                       color: ab ? "#DC2626" : "#16a34a",
//                     }}
//                   >
//                     {r.value || "—"}
//                   </div>
//                   <div style={{ fontSize: "12px", color: "#666" }}>
//                     {r.normalRange || "—"}
//                   </div>
//                 </div>
//               );
//             })
//           )}
//         </div>

//         {/* Doctor's Note */}
//         {form.note && (
//           <div style={{ marginBottom: "40px" }}>
//             <div
//               style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}
//             >
//               <div
//                 style={{
//                   fontSize: "13px",
//                   fontWeight: 700,
//                   color: "#4B69FF",
//                   minWidth: "110px",
//                 }}
//               >
//                 Doctor's Note:
//               </div>
//               <div style={{ fontSize: "13px", color: "#444", lineHeight: 1.6 }}>
//                 {form.note}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Signature */}
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "flex-end",
//             marginTop: "48px",
//           }}
//         >
//           <div style={{ textAlign: "center" }}>
//             {signature ? (
//               <img
//                 src={signature}
//                 alt="Authorized Signature"
//                 style={{
//                   height: "56px",
//                   maxWidth: "180px",
//                   objectFit: "contain",
//                   display: "block",
//                   margin: "0 auto 6px",
//                 }}
//               />
//             ) : (
//               <div
//                 style={{
//                   width: "160px",
//                   height: "50px",
//                   borderBottom: "1.5px solid #10162F",
//                   marginBottom: "6px",
//                 }}
//               />
//             )}
//             <div
//               style={{
//                 fontSize: "11px",
//                 color: "#666",
//                 letterSpacing: "0.5px",
//               }}
//             >
//               Authorized Signature
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div
//           style={{
//             marginTop: "60px",
//             paddingTop: "16px",
//             borderTop: "1px solid #eee",
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//           }}
//         >
//           <div style={{ fontSize: "10px", color: "#aaa", lineHeight: 1.7 }}>
//             <div>This is a digitally generated report.</div>
//           </div>
//           <div
//             style={{
//               width: "56px",
//               height: "56px",
//               border: "2px solid #eee",
//               borderRadius: "6px",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               fontSize: "8px",
//               color: "#ccc",
//               textAlign: "center",
//             }}
//           >
//             QR
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



import appLogo from '../../../assets/images/appLogo.png'
import { FormState, ResultRow } from '../types/labReport.types'
import { isAbnormal, fmtDisplayDate } from '../utils/helpers'

interface Props {
  form:      FormState
  results:   ResultRow[]
  signature: string | null
  innerRef:  React.RefObject<HTMLDivElement>
}

export default function PdfTemplate({ form, results, signature, innerRef }: Props) {
  const filledResults = results.filter(r => r.name)
  const abnormalCount = filledResults.filter(r => isAbnormal(r)).length
  const normalCount   = filledResults.filter(r => !isAbnormal(r)).length

  return (
    <div ref={innerRef} style={{
      width: '794px',
      minHeight: '1123px',
      background: '#f5f7fb',
      fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ── TOP HEADER BAND ────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f1f5c 0%, #1a3499 55%, #2d3f99 100%)',
        padding: '28px 48px 26px',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', right: '80px', top: '20px', width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', left: '-20px', bottom: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          {/* Logo + org name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '58px', height: '58px', borderRadius: '15px',
              background: 'rgba(255,255,255,0.13)',
              border: '1.5px solid rgba(255,255,255,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
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

          {/* Report label */}
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1.5px solid rgba(255,255,255,0.18)',
            borderRadius: '12px',
            padding: '12px 22px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '8.5px', color: 'rgba(255,255,255,0.45)', letterSpacing: '2.5px', fontWeight: 700, marginBottom: '5px' }}>
              DOCUMENT TYPE
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', letterSpacing: '1.5px' }}>
              LAB REPORT
            </div>
          </div>
        </div>
      </div>

      {/* ── PATIENT INFO STRIP ─────────────────────────────────────────── */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e6f0',
        padding: '0 48px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        flexShrink: 0,
      }}>
        {[
          { label: 'PATIENT NAME',      value: form.patientName || '—' },
          { label: 'ATTENDING DOCTOR',  value: form.doctorName  || '—' },
          { label: 'TEST REQUESTED',    value: form.testName    || '—' },
          { label: 'REPORT DATE',       value: fmtDisplayDate(form.date) || '—' },
        ].map((item, i) => (
          <div key={i} style={{
            padding: '14px 0',
            paddingLeft: i === 0 ? '0' : '20px',
            paddingRight: '20px',
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

      {/* ── BODY ───────────────────────────────────────────────────────── */}
      <div style={{ padding: '26px 48px 80px', flex: 1 }}>

        {/* Summary strip */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '22px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#eef1ff', border: '1px solid #c7d2fe', borderRadius: '8px', padding: '7px 13px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4B69FF' }} />
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#3730a3' }}>{filledResults.length} Parameters Tested</span>
          </div>
          {normalCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '7px 13px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16a34a' }} />
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#166534' }}>{normalCount} Normal</span>
            </div>
          )}
          {abnormalCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '7px 13px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#dc2626' }} />
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#991b1b' }}>{abnormalCount} Abnormal — Requires Attention</span>
            </div>
          )}
        </div>

        {/* Section heading */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{ width: '3px', height: '16px', background: 'linear-gradient(180deg, #4B69FF, #2D3F99)', borderRadius: '2px' }} />
          <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#10162F', letterSpacing: '1px' }}>TEST RESULTS</div>
        </div>

        {/* Results table */}
        <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e6f0', overflow: 'hidden', marginBottom: '22px' }}>
          {/* Head */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.5fr 0.9fr',
            background: '#f1f4ff', borderBottom: '1.5px solid #dde3f8',
            padding: '10px 18px',
          }}>
            {['Test Parameter', 'Result', 'Normal Range', 'Status'].map(h => (
              <div key={h} style={{ fontSize: '9px', fontWeight: 800, color: '#6b7280', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          {filledResults.length === 0 ? (
            <div style={{ padding: '24px', fontSize: '12px', color: '#d1d5db', textAlign: 'center' }}>
              No parameters added yet
            </div>
          ) : filledResults.map((r, i) => {
            const ab = isAbnormal(r)
            return (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.5fr 0.9fr',
                padding: '11px 18px',
                borderBottom: i < filledResults.length - 1 ? '1px solid #f3f4f6' : 'none',
                background: ab ? '#fffbfb' : (i % 2 === 0 ? '#ffffff' : '#fafbff'),
                alignItems: 'center',
              }}>
                {/* Name */}
                <div style={{ fontSize: '12.5px', color: '#1f2937', fontWeight: 600 }}>
                  {r.name}
                </div>
                {/* Value */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {ab && <span style={{ fontSize: '9px', color: '#dc2626', fontWeight: 800 }}>▲</span>}
                  <span style={{ fontSize: '13px', fontWeight: 800, color: ab ? '#dc2626' : '#16a34a' }}>
                    {r.value || '—'}
                  </span>
                </div>
                {/* Range */}
                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>
                  {r.normalRange || '—'}
                </div>
                {/* Status */}
                <div>
                  <span style={{
                    display: 'inline-block', padding: '3px 8px', borderRadius: '20px',
                    fontSize: '9px', fontWeight: 700, letterSpacing: '0.3px',
                    background: ab ? '#fef2f2' : '#f0fdf4',
                    color:      ab ? '#dc2626' : '#16a34a',
                    border:     `1px solid ${ab ? '#fecaca' : '#bbf7d0'}`,
                  }}>
                    {ab ? 'ABNORMAL' : 'NORMAL'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Doctor's Note */}
        {form.note && (
          <div style={{
            background: '#fffdf0',
            border: '1px solid #fde68a',
            borderLeft: '4px solid #f59e0b',
            borderRadius: '8px',
            padding: '14px 16px 14px 18px',
            marginBottom: '28px',
            display: 'flex', gap: '12px', alignItems: 'flex-start',
          }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '50%',
              background: '#fef3c7', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ fontSize: '13px' }}>🩺</span>
            </div>
            <div>
              <div style={{ fontSize: '9px', fontWeight: 800, color: '#92400e', letterSpacing: '1px', marginBottom: '5px' }}>
                DOCTOR'S CLINICAL NOTE
              </div>
              <div style={{ fontSize: '12.5px', color: '#78350f', lineHeight: 1.75, fontWeight: 500 }}>
                {form.note}
              </div>
            </div>
          </div>
        )}

        {/* Signature + disclaimer row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          paddingTop: '20px', borderTop: '1.5px solid #e2e6f0',
        }}>
          <div style={{ maxWidth: '340px' }}>
            <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#9ca3af', letterSpacing: '1px', marginBottom: '5px' }}>
              DISCLAIMER
            </div>
            <div style={{ fontSize: '9px', color: '#b0b7c3', lineHeight: 1.9 }}>
              This report is confidential and intended solely for the named patient.<br/>
              Results should be interpreted by a qualified medical professional.<br/>
              Digitally generated by Navhim Diagnostic Center.
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '164px', height: '58px',
              borderBottom: '1.5px solid #374151',
              marginBottom: '7px',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '4px',
            }}>
              {signature && (
                <img src={signature} alt="Signature"
                  style={{ maxHeight: '48px', maxWidth: '154px', objectFit: 'contain' }} />
              )}
            </div>
            <div style={{ fontSize: '10px', color: '#374151', fontWeight: 700, letterSpacing: '0.3px' }}>
              Authorized Signatory
            </div>
            <div style={{ fontSize: '9px', color: '#9ca3af', marginTop: '2px' }}>
              Navhim Diagnostic Center
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM FOOTER BAND ─────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(135deg, #0f1f5c 0%, #2d3f99 100%)',
        padding: '10px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: '8.5px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.3px' }}>
          © Navhim Diagnostic Center · Confidential Medical Document
        </div>
        <div style={{ fontSize: '8.5px', color: 'rgba(255,255,255,0.4)' }}>
          Report Date: {fmtDisplayDate(form.date)}
        </div>
      </div>
    </div>
  )
}