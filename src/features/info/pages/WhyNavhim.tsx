import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  getWhyNavhimData,
  updateWhyNavhimData,
  WhyNavhimData,
  ApproachItem,
} from "../infoApi/whyNavhimApi";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormState extends WhyNavhimData {
  approach: (ApproachItem & { id: string })[];
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

const APPROACH_ICONS = ["🏥", "💡", "🔬", "🎯", "❤️", "🚀", "🔐", "📈"];

// ─── Component ────────────────────────────────────────────────────────────────
export default function WhyNavhimPage() {
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeApproach, setActiveApproach] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWhyNavhimData();
      const formData: FormState = {
        ...data,
        approach: data.approach.map((item) => ({
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
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!form) return null;

  // ── field helpers ──────────────────────────────────────────────────────────
  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : null));

  const addApproach = () => {
    const newItem: ApproachItem & { id: string } = {
      id: uid(),
      title: "New Approach",
      description: "Describe this approach item...",
    };
    setForm((f) => (f ? { ...f, approach: [...f.approach, newItem] } : null));
    setActiveApproach(newItem.id);
  };

  const updateApproach = (id: string, key: keyof ApproachItem, val: string) =>
    setForm((f) =>
      f
        ? {
            ...f,
            approach: f.approach.map((e) =>
              e.id === id ? { ...e, [key]: val } : e,
            ),
          }
        : null,
    );

  const removeApproach = (id: string) =>
    setForm((f) =>
      f
        ? {
            ...f,
            approach: f.approach.filter((e) => e.id !== id),
          }
        : null,
    );

  // ── save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const payload: WhyNavhimData = {
        heading: form.heading,
        intro: form.intro,
        approach: form.approach.map(({ title, description }) => ({
          title,
          description,
        })),
        footerNote: form.footerNote,
      };
      await updateWhyNavhimData(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.message || "Failed to save data");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // ── strip html for word count ──────────────────────────────────────────────
  const wordCount = (html: string) =>
    html
      .replace(/<[^>]*>/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

  return (
    <div className="min-h-screen bg-white">
      {isEditing ? (
        /* ──────────────────────── EDITOR MODE ──────────────────────────── */
        <div className="flex flex-col gap-6 p-6">
          {/* ── Page Header ─────────────────────────────────────────────────── */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-bold text-2xl text-gray-900 tracking-tight">
                Why Navhim - Editor
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Manage the Why Navhim page content shown to visitors
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-200 bg-white text-indigo-600 text-[13px] font-semibold hover:bg-indigo-50 transition-all"
              >
                👁 Preview
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[13.5px] font-semibold shadow-lg transition-all duration-200
                  ${
                    saved
                      ? "bg-green-500"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 hover:-translate-y-0.5"
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
              {/* Heading */}
              <EditorCard title="Page Heading" icon="✦">
                <div>
                  <label className="field-label">HEADING TEXT</label>
                  <input
                    value={form.heading}
                    onChange={(e) => setField("heading", e.target.value)}
                    className="w-full border border-indigo-200 rounded-xl px-4 py-3 text-gray-900 font-bold text-lg outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white transition"
                    placeholder="e.g. Why Navhim"
                  />
                </div>
              </EditorCard>

              {/* Intro */}
              <EditorCard
                title="Introduction"
                icon="◈"
                badge={`${wordCount(form.intro)} words`}
              >
                <label className="field-label">INTRO PARAGRAPH</label>
                <div className="quill-wrapper rounded-xl overflow-hidden border border-indigo-200">
                  <ReactQuill
                    value={form.intro}
                    onChange={(v) => setField("intro", v)}
                    modules={QUILL_MODULES}
                    formats={QUILL_FORMATS}
                    placeholder="Write an engaging introduction about why choose Navhim…"
                  />
                </div>
              </EditorCard>

              {/* Approach */}
              <EditorCard
                title="Approach Items"
                icon="◉"
                badge={`${form.approach.length} items`}
                action={
                  <button
                    onClick={addApproach}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-[12px] font-semibold hover:bg-indigo-100 transition-colors"
                  >
                    <span className="text-base leading-none">+</span> Add Item
                  </button>
                }
              >
                <div className="flex flex-col gap-3">
                  {form.approach.map((item, i) => (
                    <ApproachEditor
                      key={item.id}
                      item={item}
                      index={i}
                      expanded={activeApproach === item.id}
                      onToggle={() =>
                        setActiveApproach((a) =>
                          a === item.id ? null : item.id,
                        )
                      }
                      onChange={(key, val) => updateApproach(item.id, key, val)}
                      onRemove={() => removeApproach(item.id)}
                    />
                  ))}
                  {form.approach.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 border border-dashed border-indigo-200 rounded-xl">
                      <span className="text-3xl">🎯</span>
                      <p className="text-sm text-gray-400 font-medium">
                        No approach items yet
                      </p>
                      <button
                        onClick={addApproach}
                        className="mt-1 px-4 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-[12.5px] font-semibold hover:bg-indigo-100 transition-colors"
                      >
                        + Add first item
                      </button>
                    </div>
                  )}
                </div>
              </EditorCard>

              {/* Footer Note */}
              <EditorCard
                title="Footer Note"
                icon="◇"
                badge={`${wordCount(form.footerNote)} words`}
              >
                <label className="field-label">CLOSING STATEMENT</label>
                <div className="quill-wrapper rounded-xl overflow-hidden border border-indigo-200">
                  <ReactQuill
                    value={form.footerNote}
                    onChange={(v) => setField("footerNote", v)}
                    modules={QUILL_MODULES}
                    formats={QUILL_FORMATS}
                    placeholder="Add a closing note or call to action…"
                  />
                </div>
              </EditorCard>
            </div>

            {/* Right column (1/3) — sidebar info */}
            <div className="flex flex-col gap-4">
              {/* API Payload Preview */}
              <div className="bg-white border border-indigo-100 rounded-2xl p-4">
                <p className="font-bold text-[13px] text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-base">📦</span> API Payload
                </p>
                <pre className="bg-gray-50 rounded-xl p-3 text-[10px] font-mono text-gray-600 overflow-auto max-h-64 leading-relaxed border border-gray-200">
                  {JSON.stringify(
                    {
                      heading: form.heading,
                      intro:
                        form.intro.replace(/<[^>]*>/g, "").slice(0, 50) + "…",
                      approach: form.approach.map(({ title, description }) => ({
                        title,
                        description: description.slice(0, 30) + "…",
                      })),
                      footerNote:
                        form.footerNote.replace(/<[^>]*>/g, "").slice(0, 40) +
                        "…",
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>

              {/* Stats */}
              <div className="bg-white border border-indigo-100 rounded-2xl p-4 flex flex-col gap-3">
                <p className="font-bold text-[13px] text-gray-900 flex items-center gap-2">
                  <span className="text-base">📊</span> Content Summary
                </p>
                {[
                  { label: "Intro words", value: wordCount(form.intro) },
                  {
                    label: "Footer words",
                    value: wordCount(form.footerNote),
                  },
                  { label: "Approach items", value: form.approach.length },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-[12px] text-gray-500">{s.label}</span>
                    <span className="font-bold text-[13px] text-indigo-600">
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Tips */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
                <p className="font-bold text-[12.5px] text-indigo-900 mb-2 flex items-center gap-1.5">
                  💡 Tips
                </p>
                {[
                  "Keep intro concise — 2-3 sentences.",
                  "Use bold to highlight key points.",
                  "Item titles should be 2-4 words max.",
                  "Footer should end with a CTA.",
                ].map((tip, i) => (
                  <p
                    key={i}
                    className="text-[11.5px] text-indigo-700 leading-relaxed flex gap-1.5 mb-1"
                  >
                    <span className="mt-0.5 opacity-50">•</span> {tip}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Quill global styles */}
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
              border-bottom: 1px solid #e0e7ff !important;
              background: #f8faff;
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
              stroke: #4f46e5;
            }
            .quill-wrapper .ql-toolbar button:hover .ql-fill,
            .quill-wrapper .ql-toolbar button.ql-active .ql-fill {
              fill: #4f46e5;
            }
          `}</style>
        </div>
      ) : (
        /* ──────────────────────── PREVIEW MODE ──────────────────────────── */
        <div className="min-h-screen bg-white">
          {/* Edit Button - Fixed in corner */}
          <button
            onClick={() => setIsEditing(true)}
            className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 hover:-translate-y-1 transition-all"
          >
            ✎ Edit Page
          </button>

          {/* Hero Section */}
          <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 py-16 sm:py-24">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-200 opacity-20 blur-3xl"></div>
              <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-200 opacity-20 blur-3xl"></div>
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                  {form.heading}
                </h1>
                <div
                  className="prose prose-sm sm:prose lg:prose-lg max-w-3xl mx-auto text-gray-700 mb-0"
                  dangerouslySetInnerHTML={{ __html: form.intro }}
                />
              </div>
            </div>
          </section>

          {/* Approach Section */}
          <section className="py-16 sm:py-24 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Our Approach
                </h2>
                <div className="h-1 w-16 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {form.approach.map((item, index) => (
                  <div
                    key={item.id}
                    className="group relative rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-8 hover:shadow-lg transition-shadow duration-300"
                  >
                    {/* Number Badge */}
                    <div className="absolute -top-4 -left-4 h-12 w-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold text-xl flex items-center justify-center shadow-lg">
                      {index + 1}
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 pt-4">
                      {item.title}
                    </h3>

                    <div
                      className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Footer Note Section */}
          {form.footerNote && (
            <section className="py-16 sm:py-24 bg-gradient-to-br from-indigo-900 to-purple-900">
              <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="rounded-xl bg-white/10 backdrop-blur-sm p-8 sm:p-12 border border-white/20">
                  <div
                    className="prose prose-sm sm:prose lg:prose-lg max-w-none text-white mb-0"
                    dangerouslySetInnerHTML={{ __html: form.footerNote }}
                  />
                </div>
              </div>
            </section>
          )}

          {/* CTA Section */}
          <section className="py-16 sm:py-24 bg-gray-50">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Ready to Experience Our Approach?
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Join us in revolutionizing healthcare with our innovative
                solutions.
              </p>
              <button className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition">
                Get Started Today
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
    <div className="bg-white border border-indigo-100 rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-indigo-500/60 text-sm">{icon}</span>
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

function ApproachEditor({
  item,
  index,
  expanded,
  onToggle,
  onChange,
  onRemove,
}: {
  item: ApproachItem & { id: string };
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onChange: (key: keyof ApproachItem, val: string) => void;
  onRemove: () => void;
}) {
  const icon = APPROACH_ICONS[index % APPROACH_ICONS.length];

  return (
    <div
      className={`border rounded-xl transition-all duration-200 overflow-hidden
        ${
          expanded
            ? "border-indigo-300 bg-indigo-50"
            : "border-indigo-100 bg-gray-50 hover:border-indigo-200"
        }`}
    >
      {/* Header row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={onToggle}
      >
        <div className="w-8 h-8 rounded-lg bg-white border border-indigo-200 flex items-center justify-center text-base flex-shrink-0 shadow-sm">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-gray-900 truncate">
            {item.title || "Untitled"}
          </p>
          {!expanded && (
            <p className="text-[11px] text-gray-400 truncate mt-0.5">
              {item.description}
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
            title="Remove"
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

      {/* Expanded body */}
      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-indigo-200">
          <div className="pt-3">
            <label className="field-label">TITLE</label>
            <input
              value={item.title}
              onChange={(e) => onChange("title", e.target.value)}
              className="w-full border border-indigo-200 rounded-xl px-4 py-2.5 text-[13.5px] font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white transition"
              placeholder="e.g. Clinical Operations"
            />
          </div>
          <div>
            <label className="field-label">DESCRIPTION</label>
            <textarea
              value={item.description}
              onChange={(e) => onChange("description", e.target.value)}
              rows={3}
              className="w-full border border-indigo-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-600 outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white transition resize-none leading-relaxed"
              placeholder="Describe this approach item…"
            />
            <p className="text-[10.5px] text-gray-400 mt-1">
              {item.description.trim().split(/\s+/).filter(Boolean).length}{" "}
              words
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
