// ── FieldLabel ─────────────────────────────────────────────────────────────
export function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="text-[11.5px] font-bold text-white/60 uppercase tracking-widest">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

// ── DarkInput ──────────────────────────────────────────────────────────────
export function DarkInput({
  value,
  onChange,
  placeholder,
  error,
  type = "text",
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  type?: string;
}) {
  return (
    <div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full h-10 px-3 rounded-xl text-[13px] font-medium text-white placeholder:text-white/20 outline-none transition-all bg-white/5 border focus:ring-2
          ${
            error
              ? "border-red-400/50 focus:border-red-400/80 focus:ring-red-400/10"
              : "border-white/10 focus:border-brand-light/50 focus:ring-brand-light/10 hover:border-white/20"
          }`}
      />
      {error && <p className="text-[10.5px] text-red-400 mt-1">{error}</p>}
    </div>
  );
}

// ── DarkSelect ─────────────────────────────────────────────────────────────
export function DarkSelect({
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
}) {
  return (
    <div>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className={`w-full h-10 pl-3 pr-8 rounded-xl text-[13px] font-medium appearance-none outline-none transition-all cursor-pointer bg-white/5 border focus:ring-2
            ${!value ? "text-white/25" : "text-white"}
            ${
              error
                ? "border-red-400/50 focus:border-red-400/80 focus:ring-red-400/10"
                : "border-white/10 focus:border-brand-light/50 focus:ring-brand-light/10 hover:border-white/20"
            }`}
          style={{ colorScheme: "dark" }}
        >
          {placeholder && (
            <option value="" disabled className="bg-[#111827] text-white/50">
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-[#111827] text-white">
              {o.label}
            </option>
          ))}
        </select>
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
        >
          <path
            d="M2 3.5L5 6.5L8 3.5"
            stroke="rgba(222, 216, 216, 0.35)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {error && <p className="text-[10.5px] text-red-400 mt-1">{error}</p>}
    </div>
  );
}

// ── SidebarSection ─────────────────────────────────────────────────────────
export function SidebarSection({
  icon,
  title,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <p className="text-[12.5px] font-bold text-white/80">{title}</p>
      </div>
      {action}
    </div>
  );
}
