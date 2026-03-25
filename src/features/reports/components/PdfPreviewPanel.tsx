import PdfTemplate from "./PdfTemplate";
import { FormState, ResultRow } from "../types/labReport.types";

interface Props {
  form: FormState;
  results: ResultRow[];
  signature: string | null;
  paramCount: number;
  abnormalCount: number;
}

export default function PdfPreviewPanel({
  form,
  results,
  signature,
  paramCount,
  abnormalCount,
}: Props) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F0F2F8]">
      {/* Preview header */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-40" />
            </div>
            <span className="text-[12.5px] font-bold text-navy">
              Live Preview
            </span>
          </div>
          <div className="h-4 w-px bg-gray-200" />
          <span className="text-[11.5px] text-gray-400">
            Updates as you type
          </span>
        </div>

        {/* Metadata chips */}
        <div className="flex items-center gap-2">
          {[
            { label: "A4 Portrait", icon: "📄", color: "text-gray-500" },
            {
              label: `${paramCount} parameter${paramCount !== 1 ? "s" : ""}`,
              color: paramCount > 0 ? "text-brand-primary" : "text-gray-300",
            },
            ...(abnormalCount > 0
              ? [{ label: `${abnormalCount} abnormal`, color: "text-red-500" }]
              : []),
            {
              label: signature ? "✓ Signed" : "Unsigned",
              color: signature ? "text-green-600" : "text-gray-300",
            },
          ].map((chip, i) => (
            <span
              key={i}
              className={`text-[11px] font-semibold bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full ${chip.color}`}
            >
              {chip.icon && <span className="mr-1">{chip.icon}</span>}
              {chip.label}
            </span>
          ))}
        </div>
      </div>

      {/* PDF canvas */}
      <div
        className="flex-1 overflow-auto p-6 flex items-start justify-center"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#d1d5db transparent",
        }}
      >
        <div className="relative" style={{ width: "572px", flexShrink: 0 }}>
          {/* Shadow layers */}
          <div
            className="absolute inset-0 translate-y-2 translate-x-1 rounded-sm bg-black/8"
            style={{ filter: "blur(8px)" }}
          />
          <div className="absolute inset-0 translate-y-1 rounded-sm bg-black/5" />

          {/* PDF page frame */}
          <div
            className="relative bg-white rounded-sm overflow-hidden border border-gray-200/50"
            style={{
              boxShadow:
                "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            {/* Browser chrome bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-300" />
                <div className="w-3 h-3 rounded-full bg-yellow-300" />
                <div className="w-3 h-3 rounded-full bg-green-300" />
              </div>
              <span className="text-[10px] font-medium text-gray-400 font-mono">
                NavhimReport.pdf — Page 1
              </span>
              <div className="w-16" />
            </div>

            {/* Scaled template */}
            <div
              style={{
                transform: "scale(0.72)",
                transformOrigin: "top left",
                width: "794px",
                pointerEvents: "none",
              }}
            >
              <PdfTemplate
                form={form}
                results={results}
                signature={signature}
                innerRef={{ current: null }}
              />
            </div>
          </div>

          {/* Page indicator */}
          <div className="flex items-center justify-center mt-3 gap-2">
            <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-[9px] font-bold text-white">1</span>
            </div>
            <span className="text-[11px] text-gray-400">of 1 page</span>
          </div>
        </div>
      </div>
    </div>
  );
}
