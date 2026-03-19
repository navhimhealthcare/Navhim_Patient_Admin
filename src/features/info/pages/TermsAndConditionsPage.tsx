import { useState, useEffect } from "react";
import {
  getTermsAndConditionsData,
  updateTermsAndConditionsData,
  TermsAndConditionsData,
  TermSection,
  TermPoint,
} from "../infoApi/TermsApi";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormState {
  title: string;
  sections: (TermSection & { id: string })[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 8);

const SECTION_ICONS = [
  "📅",
  "💳",
  "👥",
  "🔐",
  "⚠️",
  "🚫",
  "📋",
  "⚖️",
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function TermsAndConditionsPage() {
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTermsAndConditionsData();
      const formData: FormState = {
        ...data,
        sections: data.sections.map((item) => ({
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
          <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
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
    const newItem: TermSection & { id: string } = {
      id: uid(),
      key: "new-section",
      title: "New Section",
      description: "Section description",
      points: [{ text: "Point 1" }],
    };
    setForm((f) =>
      f ? { ...f, sections: [...f.sections, newItem] } : null
    );
    setActiveSection(newItem.id);
  };

  const updateSection = (id: string, key: keyof TermSection, val: any) =>
    setForm((f) =>
      f
        ? {
            ...f,
            sections: f.sections.map((e) =>
              e.id === id ? { ...e, [key]: val } : e
            ),
          }
        : null
    );

  const addPoint = (sectionId: string) => {
    setForm((f) =>
      f
        ? {
            ...f,
            sections: f.sections.map((section) =>
              section.id === sectionId
                ? {
                    ...section,
                    points: [...section.points, { text: "New point" }],
                  }
                : section
            ),
          }
        : null
    );
  };

  const updatePoint = (sectionId: string, pointIndex: number, text: string) => {
    setForm((f) =>
      f
        ? {
            ...f,
            sections: f.sections.map((section) =>
              section.id === sectionId
                ? {
                    ...section,
                    points: section.points.map((point, idx) =>
                      idx === pointIndex ? { text } : point
                    ),
                  }
                : section
            ),
          }
        : null
    );
  };

  const removePoint = (sectionId: string, pointIndex: number) => {
    setForm((f) =>
      f
        ? {
            ...f,
            sections: f.sections.map((section) =>
              section.id === sectionId
                ? {
                    ...section,
                    points: section.points.filter((_, idx) => idx !== pointIndex),
                  }
                : section
            ),
          }
        : null
    );
  };

  const removeSection = (id: string) =>
    setForm((f) =>
      f
        ? {
            ...f,
            sections: f.sections.filter((e) => e.id !== id),
          }
        : null
    );

  // ── save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const payload: TermsAndConditionsData = {
        title: form.title,
        sections: form.sections.map(({ key, title, description, points }) => ({
          key,
          title,
          description,
          points,
        })),
      };
      await updateTermsAndConditionsData(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.message || "Failed to save data");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };



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
      `}</style>

      {isEditing ? (
        /* ──────────────────────── EDITOR MODE ──────────────────────────── */
        <div className="flex flex-col gap-6 p-6">
          {/* ── Page Header ─────────────────────────────────────────────────── */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-bold text-2xl text-gray-900 tracking-tight">
                Terms & Conditions - Editor
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Manage the Terms & Conditions page content
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-primary/20 bg-white text-brand-primary text-[13px] font-semibold hover:bg-brand-lighter transition-all"
              >
                👁 Preview
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[13.5px] font-semibold shadow-lg transition-all duration-200 ${
                  saved
                    ? "bg-green-500"
                    : "bg-gradient-to-r from-brand-primary to-brand-gradient hover:opacity-90 hover:-translate-y-0.5"
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
                  <label className="field-label">TITLE</label>
                  <input
                    value={form.title}
                    onChange={(e) => setField("title", e.target.value)}
                    className="w-full border border-brand-primary/20 rounded-xl px-4 py-3 text-navy font-bold text-lg outline-none focus:ring-2 focus:ring-brand-primary/10 bg-white transition"
                    placeholder="e.g. Terms & Conditions"
                  />
                </div>
              </EditorCard>



              {/* Sections */}
              <EditorCard
                title="Terms Sections"
                icon="📋"
                badge={`${form.sections.length} sections`}
                action={
                  <button
                    onClick={addSection}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-lighter text-brand-primary text-[12px] font-semibold hover:bg-brand-soft transition-colors"
                  >
                    <span className="text-base leading-none">+</span> Add Section
                  </button>
                }
              >
                <div className="flex flex-col gap-3">
                  {form.sections.map((section, i) => (
                    <SectionEditor
                      key={section.id}
                      section={section}
                      index={i}
                      expanded={activeSection === section.id}
                      onToggle={() =>
                        setActiveSection((a) =>
                          a === section.id ? null : section.id
                        )
                      }
                      onChange={(key, val) =>
                        updateSection(section.id, key as keyof TermSection, val)
                      }
                      onAddPoint={() => addPoint(section.id)}
                      onUpdatePoint={(idx, text) =>
                        updatePoint(section.id, idx, text)
                      }
                      onRemovePoint={(idx) => removePoint(section.id, idx)}
                      onRemove={() => removeSection(section.id)}
                    />
                  ))}
                  {form.sections.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 border border-dashed border-brand-primary/20 rounded-xl">
                      <span className="text-3xl">📋</span>
                      <p className="text-sm text-gray-400 font-medium">
                        No sections yet
                      </p>
                      <button
                        onClick={addSection}
                        className="mt-1 px-4 py-1.5 rounded-lg bg-brand-lighter text-brand-primary text-[12.5px] font-semibold hover:bg-brand-soft transition-colors"
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
              <div className="bg-white border border-brand-primary/10 rounded-2xl p-4">
                <p className="font-bold text-[13px] text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-base">📦</span> API Payload
                </p>
                <pre className="bg-gray-50 rounded-xl p-3 text-[10px] font-mono text-gray-600 overflow-auto max-h-64 leading-relaxed border border-gray-200">
                  {JSON.stringify(
                    {
                      title: form.title,
                      sections: form.sections.slice(0, 2).map((s) => ({
                        key: s.key,
                        title: s.title,
                        description: s.description,
                        points: s.points.slice(0, 1),
                      })),
                    },
                    null,
                    2
                  )}
                </pre>
              </div>

              {/* Stats */}
              <div className="bg-white border border-brand-primary/10 rounded-2xl p-4 flex flex-col gap-3">
                <p className="font-bold text-[13px] text-gray-900 flex items-center gap-2">
                  <span className="text-base">📊</span> Content Summary
                </p>
                {[
                  { label: "Total sections", value: form.sections.length },
                  {
                    label: "Total points",
                    value: form.sections.reduce((acc, s) => acc + s.points.length, 0),
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-[12px] text-gray-500">{s.label}</span>
                    <span className="font-bold text-[13px] text-brand-primary">
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Tips */}
              <div className="bg-brand-lighter border border-brand-primary/10 rounded-2xl p-4">
                <p className="font-bold text-[12.5px] text-navy mb-2 flex items-center gap-1.5">
                  💡 Tips
                </p>
                {[
                  "Keep section titles concise.",
                  "Add descriptive section details.",
                  "List important points clearly.",
                  "Update effective date regularly.",
                ].map((tip, i) => (
                  <p
                    key={i}
                    className="text-[11.5px] text-brand-primary/80 leading-relaxed flex gap-1.5 mb-1"
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
            className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold bg-gradient-to-r from-brand-primary to-brand-gradient hover:opacity-90 hover:-translate-y-1 transition-all"
          >
            ✎ Edit Terms
          </button>

          {/* Hero Section */}
          <section className="relative overflow-hidden bg-gradient-to-br from-brand-lighter to-indigo-50/30 py-16 sm:py-24">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-brand-primary/10 opacity-20 blur-3xl"></div>
              <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-200/20 opacity-20 blur-3xl"></div>
            </div>

            <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy mb-4">
                  {form.title}
                </h1>
              </div>
            </div>
          </section>

          {/* Terms Sections */}
          <section className="py-16 sm:py-24 bg-white">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="space-y-8">
                {form.sections.map((section, index) => (
                  <div key={section.id}>
                    {/* Section Header */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="text-4xl flex-shrink-0">
                        {SECTION_ICONS[index % SECTION_ICONS.length]}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                          {section.title}
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                          {section.description}
                        </p>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="ml-16 space-y-4">
                      {section.points.map((point, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="flex-shrink-0 mt-1">
                            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-brand-lighter text-brand-primary">
                              <span className="text-sm font-semibold">✓</span>
                            </div>
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            {point.text}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Divider */}
                    {index < form.sections.length - 1 && (
                      <div className="my-8 border-t border-gray-200"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 sm:py-24 bg-gradient-to-br from-brand-primary to-brand-gradient">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Accept Our Terms
              </h2>
              <p className="text-brand-lighter/80 text-lg mb-8">
                By using our platform, you agree to these terms and conditions
              </p>
              <button className="inline-flex items-center px-8 py-4 bg-white text-brand-primary font-semibold rounded-lg hover:bg-gray-50 transition shadow-xl">
                I Accept
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
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
    <div className="bg-white border border-brand-primary/10 rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-brand-primary/60 text-sm">{icon}</span>
          <h3 className="font-bold text-[14px] text-navy">{title}</h3>
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
  onAddPoint,
  onUpdatePoint,
  onRemovePoint,
  onRemove,
}: {
  section: TermSection & { id: string };
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onChange: (key: string, val: any) => void;
  onAddPoint: () => void;
  onUpdatePoint: (idx: number, text: string) => void;
  onRemovePoint: (idx: number) => void;
  onRemove: () => void;
}) {
  const icon = SECTION_ICONS[index % SECTION_ICONS.length];

  return (
    <div
      className={`border rounded-xl transition-all duration-200 overflow-hidden ${
        expanded
          ? "border-brand-primary/30 bg-brand-lighter"
          : "border-brand-primary/10 bg-gray-50 hover:border-brand-primary/20"
      }`}
    >
      {/* Header row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={onToggle}
      >
        <div className="w-8 h-8 rounded-lg bg-white border border-brand-primary/10 flex items-center justify-center text-base flex-shrink-0 shadow-sm">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-navy truncate">
            {section.title || "Untitled"}
          </p>
          {!expanded && (
            <p className="text-[11px] text-gray-400 truncate mt-0.5">
              {section.points.length} points
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

      {/* Expanded body */}
      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-brand-primary/20">
          <div className="pt-3 space-y-3">
            {/* Key */}
            <div>
              <label className="field-label">KEY</label>
              <input
                value={section.key}
                onChange={(e) => onChange("key", e.target.value)}
                className="w-full border border-brand-primary/20 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-navy outline-none focus:ring-2 focus:ring-brand-primary/10 bg-white transition"
                placeholder="e.g. appointment"
              />
            </div>

            {/* Title */}
            <div>
              <label className="field-label">TITLE</label>
              <input
                value={section.title}
                onChange={(e) => onChange("title", e.target.value)}
                className="w-full border border-brand-primary/20 rounded-xl px-4 py-2.5 text-[13.5px] font-semibold text-navy outline-none focus:ring-2 focus:ring-brand-primary/10 bg-white transition"
                placeholder="e.g. Appointment Booking"
              />
            </div>

            {/* Description */}
            <div>
              <label className="field-label">DESCRIPTION</label>
              <textarea
                value={section.description}
                onChange={(e) => onChange("description", e.target.value)}
                rows={2}
                className="w-full border border-brand-primary/20 rounded-xl px-4 py-2.5 text-[13px] text-gray-600 outline-none focus:ring-2 focus:ring-brand-primary/10 bg-white transition resize-none"
                placeholder="Section description..."
              />
            </div>

            {/* Points */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="field-label">POINTS ({section.points.length})</label>
                <button
                  onClick={onAddPoint}
                  className="text-[12px] font-semibold text-brand-primary hover:text-brand-soft"
                >
                  + Add Point
                </button>
              </div>
              <div className="space-y-2">
                {section.points.map((point, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      value={point.text}
                      onChange={(e) => onUpdatePoint(idx, e.target.value)}
                      className="flex-1 border border-brand-primary/20 rounded-lg px-3 py-2 text-[13px] text-gray-600 outline-none focus:ring-2 focus:ring-brand-primary/10 bg-white transition"
                      placeholder="Point text..."
                    />
                    <button
                      onClick={() => onRemovePoint(idx)}
                      className="px-3 py-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}