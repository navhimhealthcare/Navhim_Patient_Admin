import { useRef } from "react";
import showToast from "../../../utils/toast";
import { STORAGE_SIG_KEY } from "../utils/constants";

interface Props {
  signature: string | null;
  onChange: (sig: string | null) => void;
}

export default function SignaturePanel({ signature, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast.warn("Image must be under 2 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      localStorage.setItem(STORAGE_SIG_KEY, base64);
      onChange(base64);
      showToast.success("Signature saved!");
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    localStorage.removeItem(STORAGE_SIG_KEY);
    onChange(null);
    if (fileRef.current) fileRef.current.value = "";
    showToast.warn("Signature removed");
  };

  return (
    <>
      {signature ? (
        <div className="flex items-center gap-3">
          <div
            className="flex-1 bg-white/5 rounded-xl border border-white/10 px-3 py-2 flex items-center justify-center"
            style={{ minHeight: "52px" }}
          >
            <img
              src={signature}
              alt="Signature"
              className="max-h-10 max-w-full object-contain"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="px-3 py-1 rounded-lg text-[11px] font-semibold text-white/60 bg-white/10 hover:bg-white/15 transition-colors whitespace-nowrap border border-white/10"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1 rounded-lg text-[11px] font-semibold text-red-400 bg-red-400/10 hover:bg-red-400/20 transition-colors border border-red-400/20"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full border border-dashed border-white/15 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-white/30 hover:bg-white/5 transition-all group"
        >
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 1v8M4 6l3 3 3-3"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 11h10"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-[11px] text-white/40 font-medium group-hover:text-white/60 transition-colors">
            Upload signature image
          </span>
          <span className="text-[10px] text-white/20">
            PNG / JPG · Max 2 MB
          </span>
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </>
  );
}
