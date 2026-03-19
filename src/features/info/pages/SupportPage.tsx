import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  getSupportData,
  updateSupportData,
  SupportData,
  FAQ,
  OfficeHours,
} from "../infoApi/supportApi";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormState extends SupportData {
  faqs: (FAQ & { id: string })[];
}

// ─── Quill toolbar config ─────────────────────────────────────────────────────
const QUILL_MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};
const QUILL_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "list",
  "bullet",
  "link",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 8);

// ─── Component ────────────────────────────────────────────────────────────────
export default function SupportPage() {
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFaq, setActiveFaq] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSupportData();
      const formData: FormState = {
        ...data,
        faqs: data.faqs.map((item) => ({
          ...item,
          id: uid(),
        })),
      };
      setForm(formData);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!form) return null;

  // ── field helpers ──────────────────────────────────────────────────────────
  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : null));

  const setOfficeHours = <K extends keyof OfficeHours>(
    k: K,
    v: OfficeHours[K],
  ) =>
    setForm((f) =>
      f ? { ...f, officeHours: { ...f.officeHours, [k]: v } } : null,
    );

  const addFaq = () => {
    const newItem: FAQ & { id: string } = {
      id: uid(),
      question: "New Question",
      answer: "Add answer here...",
    };
    setForm((f) => (f ? { ...f, faqs: [...f.faqs, newItem] } : null));
    setActiveFaq(newItem.id);
  };

  const updateFaq = (id: string, key: keyof FAQ, val: string) =>
    setForm((f) =>
      f
        ? {
            ...f,
            faqs: f.faqs.map((e) => (e.id === id ? { ...e, [key]: val } : e)),
          }
        : null,
    );

  const removeFaq = (id: string) =>
    setForm((f) =>
      f
        ? {
            ...f,
            faqs: f.faqs.filter((e) => e.id !== id),
          }
        : null,
    );

  // ── save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const payload: SupportData = {
        email: form.email,
        phone: form.phone,
        message: form.message,
        officeHours: form.officeHours,
        faqs: form.faqs.map(({ question, answer }) => ({
          question,
          answer,
        })),
      };
      await updateSupportData(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.message || "Failed to save data");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const wordCount = (html: string) =>
    html
      .replace(/<[^>]*>/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        .field-label {
          display: block;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #9ca3af;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        .quill-wrapper .ql-toolbar {
          border: none !important;
          border-bottom: 1px solid #dbeafe !important;
          background: #f0f9ff;
          padding: 8px 12px;
        }
        .quill-wrapper .ql-container {
          border: none !important;
          font-family: inherit;
          font-size: 13.5px;
        }
        .quill-wrapper .ql-editor {
          min-height: 120px;
          color: #1f2937;
          line-height: 1.75;
          padding: 14px 16px;
          background: white;
        }
        .quill-wrapper .ql-editor.ql-blank::before {
          color: #d1d5db;
          font-style: normal;
        }
        .quill-wrapper .ql-toolbar .ql-stroke {
          stroke: #6b7280;
        }
        .quill-wrapper .ql-toolbar .ql-fill {
          fill: #6b7280;
        }
        .quill-wrapper .ql-toolbar button:hover .ql-stroke,
        .quill-wrapper .ql-toolbar button.ql-active .ql-stroke {
          stroke: #2563eb;
        }
        .quill-wrapper .ql-toolbar button:hover .ql-fill,
        .quill-wrapper .ql-toolbar button.ql-active .ql-fill {
          fill: #2563eb;
        }
      `}</style>

      {isEditing ? (
        /* ──────────────────────── EDITOR MODE ──────────────────────────── */
        <div className="flex flex-col gap-6 p-6">
          {/* ── Page Header ─────────────────────────────────────────────────── */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-bold text-2xl text-gray-900 tracking-tight">
                Contact & Support - Editor
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Manage contact information and FAQs
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 bg-white text-blue-600 text-[13px] font-semibold hover:bg-blue-50 transition-all"
              >
                👁 Preview
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[13.5px] font-semibold shadow-lg transition-all duration-200 ${
                  saved
                    ? "bg-green-500"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 hover:-translate-y-0.5"
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Saving…
                  </>
                ) : saved ? (
                  "✓ Saved!"
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-800 font-medium text-sm">Error</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* ── Editor Grid ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-5 items-start">
            {/* Left column (2/3) */}
            <div className="col-span-2 flex flex-col gap-5">
              {/* Contact Info */}
              <EditorCard title="Contact Information" icon="📞">
                <div className="space-y-4">
                  <div>
                    <label className="field-label">EMAIL</label>
                    <input
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      className="w-full border border-blue-200 rounded-xl px-4 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 bg-white transition"
                      placeholder="info@company.com"
                    />
                  </div>
                  <div>
                    <label className="field-label">PHONE</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      className="w-full border border-blue-200 rounded-xl px-4 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 bg-white transition"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div>
                    <label className="field-label">WELCOME MESSAGE</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setField("message", e.target.value)}
                      rows={3}
                      className="w-full border border-blue-200 rounded-xl px-4 py-2.5 text-gray-600 outline-none focus:ring-2 focus:ring-blue-500/20 bg-white transition resize-none"
                      placeholder="Welcome message..."
                    />
                  </div>
                </div>
              </EditorCard>

              {/* Office Hours */}
              <EditorCard title="Office Hours" icon="🕐">
                <div className="space-y-4">
                  <div>
                    <label className="field-label">WEEKDAYS</label>
                    <input
                      value={form.officeHours.weekday}
                      onChange={(e) =>
                        setOfficeHours("weekday", e.target.value)
                      }
                      className="w-full border border-blue-200 rounded-xl px-4 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 bg-white transition"
                      placeholder="Monday - Friday: 9:00 AM - 7:00 PM"
                    />
                  </div>
                  <div>
                    <label className="field-label">SATURDAY</label>
                    <input
                      value={form.officeHours.saturday}
                      onChange={(e) =>
                        setOfficeHours("saturday", e.target.value)
                      }
                      className="w-full border border-blue-200 rounded-xl px-4 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 bg-white transition"
                      placeholder="Saturday: 9:00 AM - 7:00 PM"
                    />
                  </div>
                  <div>
                    <label className="field-label">SUNDAY</label>
                    <input
                      value={form.officeHours.sunday}
                      onChange={(e) => setOfficeHours("sunday", e.target.value)}
                      className="w-full border border-blue-200 rounded-xl px-4 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 bg-white transition"
                      placeholder="Sunday: Closed"
                    />
                  </div>
                </div>
              </EditorCard>

              {/* FAQs */}
              <EditorCard
                title="Frequently Asked Questions"
                icon="❓"
                badge={`${form.faqs.length} items`}
                action={
                  <button
                    onClick={addFaq}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[12px] font-semibold hover:bg-blue-100 transition-colors"
                  >
                    <span className="text-base leading-none">+</span> Add FAQ
                  </button>
                }
              >
                <div className="flex flex-col gap-3">
                  {form.faqs.map((item, i) => (
                    <FAQEditor
                      key={item.id}
                      faq={item}
                      index={i}
                      expanded={activeFaq === item.id}
                      onToggle={() =>
                        setActiveFaq((a) => (a === item.id ? null : item.id))
                      }
                      onChange={(key, val) => updateFaq(item.id, key, val)}
                      onRemove={() => removeFaq(item.id)}
                    />
                  ))}
                  {form.faqs.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 border border-dashed border-blue-200 rounded-xl">
                      <span className="text-3xl">❓</span>
                      <p className="text-sm text-gray-400 font-medium">
                        No FAQs yet
                      </p>
                      <button
                        onClick={addFaq}
                        className="mt-1 px-4 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[12.5px] font-semibold hover:bg-blue-100 transition-colors"
                      >
                        + Add first FAQ
                      </button>
                    </div>
                  )}
                </div>
              </EditorCard>
            </div>

            {/* Right column (1/3) — sidebar info */}
            <div className="flex flex-col gap-4">
              {/* API Payload Preview */}
              <div className="bg-white border border-blue-100 rounded-2xl p-4">
                <p className="font-bold text-[13px] text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-base">📦</span> API Payload
                </p>
                <pre className="bg-gray-50 rounded-xl p-3 text-[10px] font-mono text-gray-600 overflow-auto max-h-64 leading-relaxed border border-gray-200">
                  {JSON.stringify(
                    {
                      email: form.email,
                      phone: form.phone,
                      message: form.message.slice(0, 30) + "…",
                      officeHours: form.officeHours,
                      faqs: form.faqs
                        .slice(0, 2)
                        .map(({ question, answer }) => ({
                          question,
                          answer: answer.slice(0, 30) + "…",
                        })),
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>

              {/* Stats */}
              <div className="bg-white border border-blue-100 rounded-2xl p-4 flex flex-col gap-3">
                <p className="font-bold text-[13px] text-gray-900 flex items-center gap-2">
                  <span className="text-base">📊</span> Content Summary
                </p>
                {[
                  { label: "Email", value: form.email || "Not set" },
                  { label: "Phone", value: form.phone || "Not set" },
                  { label: "FAQ items", value: form.faqs.length },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-between text-[12px]"
                  >
                    <span className="text-gray-500">{s.label}</span>
                    <span className="font-bold text-blue-600">
                      {typeof s.value === "number" ? s.value : s.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <p className="font-bold text-[12.5px] text-blue-900 mb-2 flex items-center gap-1.5">
                  💡 Tips
                </p>
                {[
                  "Keep contact info up-to-date.",
                  "Update hours regularly.",
                  "FAQs should be concise.",
                  "Cover common questions.",
                ].map((tip, i) => (
                  <p
                    key={i}
                    className="text-[11.5px] text-blue-700 leading-relaxed flex gap-1.5 mb-1"
                  >
                    <span className="mt-0.5 opacity-50">•</span> {tip}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ──────────────────────── PREVIEW MODE ──────────────────────────── */
        <div className="min-h-screen bg-white">
          {/* Edit Button */}
          <button
            onClick={() => setIsEditing(true)}
            className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 hover:-translate-y-1 transition-all"
          >
            ✎ Edit Support
          </button>

          {/* Hero Section */}
          <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 py-16 sm:py-24">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-200 opacity-20 blur-3xl"></div>
              <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-200 opacity-20 blur-3xl"></div>
            </div>

            <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                  Contact & Support
                </h1>
                <p className="text-lg text-gray-600 mb-8">{form.message}</p>

                {/* Contact Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
                    <p className="text-3xl mb-3">📧</p>
                    <p className="text-gray-600 text-sm mb-2">Email</p>
                    <a
                      href={`mailto:${form.email}`}
                      className="text-blue-600 font-semibold hover:underline text-lg"
                    >
                      {form.email}
                    </a>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
                    <p className="text-3xl mb-3">📱</p>
                    <p className="text-gray-600 text-sm mb-2">Phone</p>
                    <a
                      href={`tel:${form.phone}`}
                      className="text-blue-600 font-semibold hover:underline text-lg"
                    >
                      {form.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Office Hours Section */}
          <section className="py-16 sm:py-24 bg-gray-50 border-t border-gray-200">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Office Hours
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: "📅",
                    label: "Weekdays",
                    value: form.officeHours.weekday,
                  },
                  {
                    icon: "📅",
                    label: "Saturday",
                    value: form.officeHours.saturday,
                  },
                  {
                    icon: "📅",
                    label: "Sunday",
                    value: form.officeHours.sunday,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
                  >
                    <p className="text-3xl mb-2">{item.icon}</p>
                    <p className="text-gray-600 text-sm font-semibold mb-1">
                      {item.label}
                    </p>
                    <p className="text-gray-900 font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQs Section */}
          {form.faqs.length > 0 && (
            <section className="py-16 sm:py-24 bg-white">
              <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {form.faqs.map((faq) => (
                    <FAQItem
                      key={faq.id}
                      question={faq.question}
                      answer={faq.answer}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* CTA Section */}
          <section className="py-16 sm:py-24 bg-gradient-to-br from-blue-600 to-indigo-600">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Can't Find What You're Looking For?
              </h2>
              <p className="text-blue-100 text-lg mb-8">
                Reach out to our support team and we'll help you right away.
              </p>
              <button className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition">
                Send Message
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EditorCard({
  title,
  icon,
  badge,
  action,
  children,
}: {
  title: string;
  icon: string;
  badge?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-blue-100 rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-blue-500/60 text-sm">{icon}</span>
          <h3 className="font-bold text-[14px] text-gray-900">{title}</h3>
          {badge && (
            <span className="px-2 py-0.5 bg-gray-100 text-[10.5px] font-semibold text-gray-500 rounded-full">
              {badge}
            </span>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function FAQEditor({
  faq,
  index,
  expanded,
  onToggle,
  onChange,
  onRemove,
}: {
  faq: FAQ & { id: string };
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onChange: (key: keyof FAQ, val: string) => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={`border rounded-xl transition-all duration-200 overflow-hidden ${
        expanded
          ? "border-blue-300 bg-blue-50"
          : "border-blue-100 bg-gray-50 hover:border-blue-200"
      }`}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={onToggle}
      >
        <div className="w-8 h-8 rounded-lg bg-white border border-blue-200 flex items-center justify-center text-base flex-shrink-0">
          ❓
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-gray-900 truncate">
            {faq.question || "Untitled"}
          </p>
          {!expanded && (
            <p className="text-[11px] text-gray-400 truncate mt-0.5">
              {faq.answer}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="w-7 h-7 rounded-lg hover:bg-red-100 text-gray-300 hover:text-red-600 flex items-center justify-center text-lg transition-all"
          >
            ×
          </button>
          <span
            className={`text-gray-300 text-xs transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
          >
            ▾
          </span>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-blue-200">
          <div className="pt-3">
            <label className="field-label">QUESTION</label>
            <input
              value={faq.question}
              onChange={(e) => onChange("question", e.target.value)}
              className="w-full border border-blue-200 rounded-xl px-4 py-2.5 text-[13.5px] font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 bg-white transition"
              placeholder="Ask your question..."
            />
          </div>
          <div>
            <label className="field-label">ANSWER</label>
            <textarea
              value={faq.answer}
              onChange={(e) => onChange("answer", e.target.value)}
              rows={4}
              className="w-full border border-blue-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-600 outline-none focus:ring-2 focus:ring-blue-500/20 bg-white transition resize-none"
              placeholder="Provide the answer..."
            />
          </div>
        </div>
      )}
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
      >
        <span className="font-semibold text-gray-900 text-left">
          {question}
        </span>
        <span
          className={`text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>
      {open && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-gray-700 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}
