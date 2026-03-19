import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  getPrivacyPolicyData,
  updatePrivacyPolicyData,
  PrivacyPolicyData,
  PolicySection,
} from "../infoApi/Privacypolicyapi";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormState extends PrivacyPolicyData {
  sections: (PolicySection & { id: string })[];
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

const SECTION_ICONS = ["🎯", "🔗", "🔒", "🛡️", "📋", "⚙️", "📞", "✅"];

// ─── Component ────────────────────────────────────────────────────────────────
export default function PrivacyPolicyPage() {
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load data on mount
  useEffect(() => {
    console.log("PrivacyPolicyPage mounted");
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPrivacyPolicyData();
      console.log("Privacy API Response:", data);

      const formData: FormState = {
        title: data?.title || "Privacy & Policy",
        content: data?.content || "",
        sections:
          Array.isArray(data?.sections) && data.sections.length > 0
            ? data.sections.map((item) => ({ ...item, id: uid() }))
            : [],
      };
      setForm(formData);
    } catch (err: any) {
      setError(err.message || "Failed to load dynamic data");
      console.error("Privacy Load Error:", err);

      // Fallback only to avoid total crash, but keep it clear it's a fallback
      setForm({
        title: "Privacy & Policy (Fallback)",
        content:
          "<p>Could not load dynamic content. Please check your API connection.</p>",
        sections: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!form) return null;

  // ── field helpers ──────────────────────────────────────────────────────────
  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : null));

  const addSection = () => {
    const newItem: PolicySection & { id: string } = {
      id: uid(),
      icon: "📋",
      heading: "New Section",
      content: "Add section content here...",
    };
    setForm((f) => (f ? { ...f, sections: [...f.sections, newItem] } : null));
    setActiveSection(newItem.id);
  };

  const updateSection = (id: string, key: keyof PolicySection, val: string) =>
    setForm((f) =>
      f
        ? {
            ...f,
            sections: f.sections.map((e) =>
              e.id === id ? { ...e, [key]: val } : e,
            ),
          }
        : null,
    );

  const removeSection = (id: string) =>
    setForm((f) =>
      f
        ? {
            ...f,
            sections: f.sections.filter((e) => e.id !== id),
          }
        : null,
    );

  // ── save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const payload: PrivacyPolicyData = {
        title: form.title,
        content: form.content,
        sections: form.sections.map(({ icon, heading, content }) => ({
          icon,
          heading,
          content,
        })),
      };
      await updatePrivacyPolicyData(payload);
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
                Privacy Policy - Editor
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Manage the Privacy Policy page content shown to visitors
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 bg-white text-emerald-600 text-[13px] font-semibold hover:bg-emerald-50 transition-all"
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
                      : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 hover:-translate-y-0.5"
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
              {/* Title */}
              <EditorCard title="Page Title" icon="✦">
                <div>
                  <label className="field-label">TITLE TEXT</label>
                  <input
                    value={form.title}
                    onChange={(e) => setField("title", e.target.value)}
                    className="w-full border border-emerald-200 rounded-xl px-4 py-3 text-gray-900 font-bold text-lg outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white transition"
                    placeholder="e.g. Privacy Policy"
                  />
                </div>
              </EditorCard>

              {/* Main Content */}
              <EditorCard
                title="Main Content"
                icon="◈"
                badge={`${wordCount(form.content)} words`}
              >
                <label className="field-label">CONTENT</label>
                <div className="quill-wrapper rounded-xl overflow-hidden border border-emerald-200">
                  <ReactQuill
                    value={form.content}
                    onChange={(v) => setField("content", v)}
                    modules={QUILL_MODULES}
                    formats={QUILL_FORMATS}
                    placeholder="Write the main privacy policy content…"
                  />
                </div>
              </EditorCard>

              {/* Sections */}
              <EditorCard
                title="Policy Sections"
                icon="◉"
                badge={`${form.sections.length} items`}
                action={
                  <button
                    onClick={addSection}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[12px] font-semibold hover:bg-emerald-100 transition-colors"
                  >
                    <span className="text-base leading-none">+</span> Add
                    Section
                  </button>
                }
              >
                <div className="flex flex-col gap-3">
                  {form.sections.map((item, i) => (
                    <SectionEditor
                      key={item.id}
                      section={item}
                      index={i}
                      expanded={activeSection === item.id}
                      onToggle={() =>
                        setActiveSection((a) =>
                          a === item.id ? null : item.id,
                        )
                      }
                      onChange={(key, val) => updateSection(item.id, key, val)}
                      onRemove={() => removeSection(item.id)}
                    />
                  ))}
                  {form.sections.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 border border-dashed border-emerald-200 rounded-xl">
                      <span className="text-3xl">📋</span>
                      <p className="text-sm text-gray-400 font-medium">
                        No sections yet
                      </p>
                      <button
                        onClick={addSection}
                        className="mt-1 px-4 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[12.5px] font-semibold hover:bg-emerald-100 transition-colors"
                      >
                        + Add first section
                      </button>
                    </div>
                  )}
                </div>
              </EditorCard>
            </div>

            {/* Right column (1/3) — sidebar info */}
            <div className="flex flex-col gap-4">
              {/* API Payload Preview */}
              <div className="bg-white border border-emerald-100 rounded-2xl p-4">
                <p className="font-bold text-[13px] text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-base">📦</span> API Payload
                </p>
                <pre className="bg-gray-50 rounded-xl p-3 text-[10px] font-mono text-gray-600 overflow-auto max-h-64 leading-relaxed border border-gray-200">
                  {JSON.stringify(
                    {
                      title: form.title,
                      content:
                        form.content.replace(/<[^>]*>/g, "").slice(0, 50) + "…",
                      sections: form.sections.map(
                        ({ icon, heading, content }) => ({
                          icon,
                          heading,
                          content: content.slice(0, 30) + "…",
                        }),
                      ),
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>

              {/* Stats */}
              <div className="bg-white border border-emerald-100 rounded-2xl p-4 flex flex-col gap-3">
                <p className="font-bold text-[13px] text-gray-900 flex items-center gap-2">
                  <span className="text-base">📊</span> Content Summary
                </p>
                {[
                  {
                    label: "Main content words",
                    value: wordCount(form.content),
                  },
                  { label: "Policy sections", value: form.sections.length },
                  {
                    label: "Total section words",
                    value: form.sections.reduce(
                      (acc, s) => acc + wordCount(s.content),
                      0,
                    ),
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-[12px] text-gray-500">{s.label}</span>
                    <span className="font-bold text-[13px] text-emerald-600">
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Tips */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <p className="font-bold text-[12.5px] text-emerald-900 mb-2 flex items-center gap-1.5">
                  💡 Tips
                </p>
                {[
                  "Keep content clear and concise.",
                  "Use bold for important points.",
                  "Organize sections logically.",
                  "Update dates regularly.",
                ].map((tip, i) => (
                  <p
                    key={i}
                    className="text-[11.5px] text-emerald-700 leading-relaxed flex gap-1.5 mb-1"
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
              border-bottom: 1px solid #d1fae5 !important;
              background: #f0fdf4;
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
              stroke: #059669;
            }
            .quill-wrapper .ql-toolbar button:hover .ql-fill,
            .quill-wrapper .ql-toolbar button.ql-active .ql-fill {
              fill: #059669;
            }
          `}</style>
        </div>
      ) : (
        /* ──────────────────────── PREVIEW MODE ──────────────────────────── */
        <div className="min-h-screen bg-white">
          {/* Edit Button - Fixed in corner */}
          <button
            onClick={() => setIsEditing(true)}
            className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 hover:-translate-y-1 transition-all"
          >
            ✎ Edit Policy
          </button>

          {/* Hero Section */}
          <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 py-16 sm:py-24">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-emerald-200 opacity-20 blur-3xl"></div>
              <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-teal-200 opacity-20 blur-3xl"></div>
            </div>

            <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                  {form.title}
                </h1>
                <p className="text-sm text-gray-500 mb-6">
                  Last updated on{" "}
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </section>

          {/* Main Content Section */}
          <section className="py-12 sm:py-16 bg-white border-b border-gray-200">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div
                className="prose prose-sm sm:prose lg:prose-lg max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: form.content }}
              />
            </div>
          </section>

          {/* Sections */}
          {form.sections.length > 0 && (
            <section className="py-16 sm:py-24 bg-gray-50">
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-12">
                  Key Sections
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {form.sections.map((section) => (
                    <div
                      key={section.id}
                      className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-4xl flex-shrink-0">
                          {section.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-3">
                            {section.heading}
                          </h3>
                          <div
                            className="prose prose-sm max-w-none text-gray-600"
                            dangerouslySetInnerHTML={{
                              __html: section.content,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* CTA Section */}
          <section className="py-16 sm:py-24 bg-white border-t border-gray-200">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Questions About Our Privacy?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Contact our support team for any privacy-related inquiries
              </p>
              <button className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition">
                Contact Us
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
    <div className="bg-white border border-emerald-100 rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-emerald-500/60 text-sm">{icon}</span>
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

function SectionEditor({
  section,
  index,
  expanded,
  onToggle,
  onChange,
  onRemove,
}: {
  section: PolicySection & { id: string };
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onChange: (key: keyof PolicySection, val: string) => void;
  onRemove: () => void;
}) {
  const icons = SECTION_ICONS;

  return (
    <div
      className={`border rounded-xl transition-all duration-200 overflow-hidden
        ${
          expanded
            ? "border-emerald-300 bg-emerald-50"
            : "border-emerald-100 bg-gray-50 hover:border-emerald-200"
        }`}
    >
      {/* Header row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={onToggle}
      >
        <div className="w-8 h-8 rounded-lg bg-white border border-emerald-200 flex items-center justify-center text-base flex-shrink-0 shadow-sm">
          {section.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-gray-900 truncate">
            {section.heading || "Untitled"}
          </p>
          {!expanded && (
            <p className="text-[11px] text-gray-400 truncate mt-0.5">
              {section.content}
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
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-emerald-200">
          {/* Icon */}
          <div className="pt-3">
            <label className="field-label">ICON</label>
            <input
              value={section.icon}
              onChange={(e) => onChange("icon", e.target.value)}
              className="w-full border border-emerald-200 rounded-xl px-4 py-2.5 text-[13.5px] font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white transition"
              placeholder="e.g. 🔒"
              maxLength={2}
            />
          </div>

          {/* Heading */}
          <div>
            <label className="field-label">HEADING</label>
            <input
              value={section.heading}
              onChange={(e) => onChange("heading", e.target.value)}
              className="w-full border border-emerald-200 rounded-xl px-4 py-2.5 text-[13.5px] font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white transition"
              placeholder="e.g. Data Security"
            />
          </div>

          {/* Content */}
          <div>
            <label className="field-label">CONTENT</label>
            <textarea
              value={section.content}
              onChange={(e) => onChange("content", e.target.value)}
              rows={4}
              className="w-full border border-emerald-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-600 outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white transition resize-none leading-relaxed"
              placeholder="Describe this section…"
            />
            <p className="text-[10.5px] text-gray-400 mt-1">
              {section.content.trim().split(/\s+/).filter(Boolean).length} words
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
