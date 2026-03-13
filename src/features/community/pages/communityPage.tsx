import { useState, useMemo } from "react";
import { useCommunity, EMPTY_FILTER } from "../hooks/useCommunity";
import { useCategories } from "../../categories/hooks/useCategories";
import { CommunityPost, PostSort } from "../types/community.types";
import { SectionLoader } from "../../../components/Loader/Loader";
import CreatePostModal from "../components/createPostModal";
import DeletePostModal from "../components/deletePostModal";

// ── Helpers ──────────────────────────────────────────────────────────────
const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

// ── Type configs ─────────────────────────────────────────────────────────
const TYPE_CFG: Record<
  string,
  {
    label: string;
    icon: string;
    pill: string;
    pillText: string;
    accent: string;
    accentLight: string;
  }
> = {
  content: {
    label: "Article",
    icon: "📄",
    pill: "bg-[#EEF1FF]",
    pillText: "text-[#4B69FF]",
    accent: "#4B69FF",
    accentLight: "#EEF1FF",
  },
  question: {
    label: "Question",
    icon: "💬",
    pill: "bg-amber-50",
    pillText: "text-amber-600",
    accent: "#F59E0B",
    accentLight: "#FFFBEB",
  },
  poll: {
    label: "Poll",
    icon: "📊",
    pill: "bg-violet-50",
    pillText: "text-violet-600",
    accent: "#7C3AED",
    accentLight: "#F5F3FF",
  },
};

const SORT_OPTIONS: { value: PostSort; label: string; icon: string }[] = [
  { value: "newest", label: "Newest", icon: "🕐" },
  { value: "oldest", label: "Oldest", icon: "📅" },
  { value: "trending", label: "Trending", icon: "🔥" },
  { value: "mostLiked", label: "Most Liked", icon: "❤️" },
];

// ── Post Card ─────────────────────────────────────────────────────────────
function PostCard({
  post,
  onDelete,
}: {
  post: CommunityPost;
  onDelete: (p: CommunityPost) => void;
}) {
  const cfg = TYPE_CFG[post.type] ?? TYPE_CFG.content;
  const img = post.media?.find((m) => m.type === "image");

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden h-full">
      <div
        className="h-1 w-full flex-shrink-0"
        style={{ background: cfg.accent }}
      />

      {/* Fixed image slot */}
      <div className="relative h-44 overflow-hidden flex-shrink-0 bg-gray-50">
        {img ? (
          <>
            <img
              src={img.url}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-400"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            {post.media.length > 1 && (
              <span className="absolute bottom-2 right-2 text-[10px] font-bold text-white bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
                +{post.media.length - 1}
              </span>
            )}
          </>
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${cfg.accentLight}, white)`,
            }}
          >
            <span className="text-5xl opacity-20">{cfg.icon}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 p-5 flex-1">
        {/* Type pill + category + delete */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide px-2.5 py-1 rounded-lg ${cfg.pill} ${cfg.pillText}`}
          >
            <span>{cfg.icon}</span>
            {cfg.label}
          </span>
          {post.category?.name && (
            <span className="text-[11px] font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 truncate max-w-[110px]">
              {post.category.name}
            </span>
          )}
          <button
            onClick={() => onDelete(post)}
            className="ml-auto w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 text-gray-300 hover:text-red-500 hover:bg-red-50 hover:border-red-100 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path
                d="M1.5 3.5h10M5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M10.5 3.5l-.7 7a1 1 0 01-1 .9H4.2a1 1 0 01-1-.9l-.7-7"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Title — always 2 lines */}
        <h3 className="font-poppins font-bold text-[15px] text-navy leading-snug line-clamp-2 min-h-[40px]">
          {post.title}
        </h3>

        {/* Description — always 3 lines */}
        <p className="text-[12.5px] text-gray-400 leading-relaxed line-clamp-3 min-h-[57px]">
          {post.description}
        </p>

        {/* Tags — fixed height */}
        <div className="flex flex-wrap gap-1.5 min-h-[24px]">
          {post.tags?.slice(0, 4).map((t) => (
            <span
              key={t}
              style={{ background: cfg.accentLight, color: cfg.accent }}
              className="text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full"
            >
              #{t}
            </span>
          ))}
          {(post.tags?.length ?? 0) > 4 && (
            <span className="text-[10.5px] font-semibold text-gray-300 bg-gray-50 px-2 py-0.5 rounded-full">
              +{post.tags.length - 4}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-sm overflow-hidden flex-shrink-0 border border-gray-200">
              {post.postedBy?.image ? (
                <img
                  src={post.postedBy.image}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs">👤</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[11.5px] font-bold text-navy truncate leading-tight">
                {post.isAnonymous ? "Anonymous" : post.postedBy?.name?.trim()}
              </p>
              <p className="text-[10px] text-gray-300 capitalize leading-tight">
                {post.postedBy?.role}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1 text-[12px] font-semibold text-gray-400">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path
                  d="M6.5 11.5S1.5 8 1.5 4.5a2.5 2.5 0 015 0 2.5 2.5 0 015 0C11.5 8 6.5 11.5 6.5 11.5z"
                  fill="#FCA5A5"
                  stroke="#EF4444"
                  strokeWidth="1.2"
                />
              </svg>
              {post.likesCount}
            </div>
            <div className="flex items-center gap-1 text-[12px] font-semibold text-gray-400">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path
                  d="M1.5 2.5h10a.5.5 0 01.5.5v6a.5.5 0 01-.5.5H7L4.5 11.5V9.5H2a.5.5 0 01-.5-.5V3a.5.5 0 01.5-.5z"
                  stroke="#9CA3AF"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
              {post.commentsCount}
            </div>
            <span className="text-[10.5px] text-gray-300 font-medium">
              {timeAgo(post.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── List Row ──────────────────────────────────────────────────────────────
function PostRow({
  post,
  onDelete,
}: {
  post: CommunityPost;
  onDelete: (p: CommunityPost) => void;
}) {
  const cfg = TYPE_CFG[post.type] ?? TYPE_CFG.content;
  const img = post.media?.find((m) => m.type === "image");

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 overflow-hidden">
      <div className="flex items-stretch">
        <div
          className="w-1 flex-shrink-0 rounded-l-2xl"
          style={{ background: cfg.accent }}
        />
        <div className="flex items-center gap-4 px-5 py-4 flex-1">
          <div
            className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden border border-gray-100 flex items-center justify-center"
            style={{ background: cfg.accentLight }}
          >
            {img ? (
              <img
                src={img.url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">{cfg.icon}</span>
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[10.5px] font-black uppercase tracking-wide px-2.5 py-0.5 rounded-lg ${cfg.pill} ${cfg.pillText}`}
              >
                {cfg.icon} {cfg.label}
              </span>
              {post.category?.name && (
                <span className="text-[10.5px] text-gray-400 font-medium">
                  {post.category.name}
                </span>
              )}
              {post.tags?.slice(0, 3).map((t) => (
                <span
                  key={t}
                  style={{ background: cfg.accentLight, color: cfg.accent }}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                >
                  #{t}
                </span>
              ))}
            </div>
            <p className="font-poppins font-bold text-[14px] text-navy truncate">
              {post.title}
            </p>
            <p className="text-[12px] text-gray-400 truncate">
              {post.description}
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-shrink-0 w-36">
            <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden text-sm flex-shrink-0">
              {post.postedBy?.image ? (
                <img
                  src={post.postedBy.image}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                "👤"
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[11.5px] font-bold text-navy truncate">
                {post.isAnonymous ? "Anonymous" : post.postedBy?.name?.trim()}
              </p>
              <p className="text-[10.5px] text-gray-300">
                {timeAgo(post.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 flex-shrink-0">
            <div className="flex flex-col items-center gap-0.5">
              <span className="font-poppins font-black text-[18px] text-navy leading-none">
                {post.likesCount}
              </span>
              <span className="text-[10px] text-gray-300 flex items-center gap-0.5">
                <span className="text-red-400">♥</span> Likes
              </span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="font-poppins font-black text-[18px] text-navy leading-none">
                {post.commentsCount}
              </span>
              <span className="text-[10px] text-gray-300">💬 Comments</span>
            </div>
          </div>
          <button
            onClick={() => onDelete(post)}
            className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 text-gray-300 hover:text-red-500 hover:bg-red-50 hover:border-red-100 flex items-center justify-center transition-all flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 13 13" fill="none">
              <path
                d="M1.5 3.5h10M5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M10.5 3.5l-.7 7a1 1 0 01-1 .9H4.2a1 1 0 01-1-.9l-.7-7"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────
function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const delta = 2;
  const start = Math.max(1, Math.min(page - delta, totalPages - delta * 2));
  const end = Math.min(totalPages, Math.max(page + delta, delta * 2 + 1));
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3 flex items-center justify-between">
      <p className="text-[12.5px] text-gray-400">
        Showing <span className="font-bold text-navy">{from}</span>–
        <span className="font-bold text-navy">{to}</span> of{" "}
        <span className="font-bold text-navy">{total}</span> posts
      </p>
      <div className="flex items-center gap-1">
        {[
          { label: "«", p: 1 },
          { label: "‹", p: page - 1 },
        ].map((b) => (
          <button
            key={b.label}
            onClick={() => onPage(b.p)}
            disabled={page === 1}
            className="w-8 h-8 rounded-lg text-[13px] font-bold text-gray-400 hover:bg-brand-lighter hover:text-brand-primary disabled:opacity-25 disabled:cursor-not-allowed transition-all"
          >
            {b.label}
          </button>
        ))}
        {start > 1 && (
          <span className="w-8 text-center text-gray-300 text-[12px]">…</span>
        )}
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`w-8 h-8 rounded-lg text-[12.5px] font-bold transition-all
              ${p === page ? "bg-brand-primary text-white shadow-sm shadow-brand-primary/30" : "text-gray-500 hover:bg-brand-lighter hover:text-brand-primary"}`}
          >
            {p}
          </button>
        ))}
        {end < totalPages && (
          <span className="w-8 text-center text-gray-300 text-[12px]">…</span>
        )}
        {[
          { label: "›", p: page + 1 },
          { label: "»", p: totalPages },
        ].map((b) => (
          <button
            key={b.label}
            onClick={() => onPage(b.p)}
            disabled={page === totalPages}
            className="w-8 h-8 rounded-lg text-[13px] font-bold text-gray-400 hover:bg-brand-lighter hover:text-brand-primary disabled:opacity-25 disabled:cursor-not-allowed transition-all"
          >
            {b.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function CommunityPage() {
  const {
    posts,
    loading,
    actionLoading,
    page,
    totalPages,
    total,
    setPage,
    filter,
    updateFilter,
    createPost,
    deletePost,
  } = useCommunity();

  const { categories } = useCategories();

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CommunityPost | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const hasFilters =
    filter.search ||
    filter.type !== "all" ||
    filter.category !== "all" ||
    filter.sort !== "newest" ||
    filter.postedBy !== "all";

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const ok = await deletePost(deleteTarget._id);
    if (ok) setDeleteTarget(null);
  };

  // Debounce search — update filter after user stops typing
  const [searchDraft, setSearchDraft] = useState(filter.search);
  const searchTimer = useMemo(() => ({ id: 0 as any }), []);
  const handleSearchChange = (val: string) => {
    setSearchDraft(val);
    clearTimeout(searchTimer.id);
    searchTimer.id = setTimeout(() => {
      updateFilter((p) => ({ ...p, search: val }));
    }, 450);
  };

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* ══ HEADER ═══════════════════════════════════════════════════════ */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-poppins font-black text-[28px] text-navy tracking-tight leading-none">
            Community
          </h1>
          <p className="text-[13.5px] text-gray-400 font-medium">
            Manage health posts, articles & questions from your community
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-br from-brand-primary to-brand-gradient text-white text-[13.5px] font-bold shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:-translate-y-0.5 transition-all duration-200"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 1v12M1 7h12"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          Create Post
        </button>
      </div>

      {/* ══ FILTER BAR ═══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tab strip: type filter */}
        <div className="flex border-b border-gray-100">
          {(
            [
              { key: "all", label: "All Posts" },
              { key: "content", label: "Articles" },
              { key: "question", label: "Questions" },
            ] as const
          ).map((tab) => {
            const active = filter.type === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => updateFilter((p) => ({ ...p, type: tab.key }))}
                className={`relative flex items-center gap-2 px-6 py-3.5 text-[13px] font-bold transition-all
                  ${active ? "text-brand-primary" : "text-gray-400 hover:text-navy"}`}
              >
                {tab.label}
                {active && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-brand-primary rounded-t-full" />
                )}
              </button>
            );
          })}

          {/* Right controls */}
          <div className="ml-auto flex items-center gap-2 px-4 py-2">
            {/* Search with debounce */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
              >
                <circle
                  cx="6"
                  cy="6"
                  r="4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M9.5 9.5L12.5 12.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <input
                value={searchDraft}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search posts…"
                className="h-9 w-52 pl-9 pr-3 bg-gray-50 rounded-xl text-[12.5px] font-medium text-navy placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-brand-primary/10 focus:bg-white border border-transparent focus:border-brand-primary/20 transition-all"
              />
              {searchDraft && (
                <button
                  onClick={() => {
                    setSearchDraft("");
                    updateFilter((p) => ({ ...p, search: "" }));
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-500 text-[10px]"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category */}
            <div className="relative">
              <select
                value={filter.category}
                onChange={(e) =>
                  updateFilter((p) => ({ ...p, category: e.target.value }))
                }
                className={`h-9 pl-3 pr-7 rounded-xl text-[12.5px] font-semibold outline-none border transition-all appearance-none cursor-pointer
                  ${filter.category !== "all" ? "bg-brand-lighter border-brand-primary/20 text-brand-primary" : "bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100"}`}
              >
                <option value="all">All Categories</option>
                {categories?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
              >
                <path
                  d="M2 3.5L5 6.5L8 3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={filter.sort}
                onChange={(e) =>
                  updateFilter((p) => ({
                    ...p,
                    sort: e.target.value as PostSort,
                  }))
                }
                className={`h-9 pl-3 pr-7 rounded-xl text-[12.5px] font-semibold outline-none border transition-all appearance-none cursor-pointer
                  ${filter.sort !== "newest" ? "bg-violet-50 border-violet-200 text-violet-700" : "bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100"}`}
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.icon} {s.label}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
              >
                <path
                  d="M2 3.5L5 6.5L8 3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {hasFilters && (
              <button
                onClick={() => {
                  setSearchDraft("");
                  updateFilter(() => ({ ...EMPTY_FILTER }));
                }}
                className="h-9 px-3 rounded-xl text-[12px] font-semibold text-gray-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all whitespace-nowrap"
              >
                ✕ Clear
              </button>
            )}

            <div className="w-px h-5 bg-gray-200" />

            {/* View toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1 gap-0.5">
              {(["grid", "list"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setViewMode(v)}
                  className={`w-8 h-7 rounded-lg flex items-center justify-center transition-all
                    ${viewMode === v ? "bg-white shadow-sm text-brand-primary" : "text-gray-400 hover:text-navy"}`}
                >
                  {v === "grid" ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect
                        x="1"
                        y="1"
                        width="5"
                        height="5"
                        rx="1"
                        fill="currentColor"
                      />
                      <rect
                        x="8"
                        y="1"
                        width="5"
                        height="5"
                        rx="1"
                        fill="currentColor"
                      />
                      <rect
                        x="1"
                        y="8"
                        width="5"
                        height="5"
                        rx="1"
                        fill="currentColor"
                      />
                      <rect
                        x="8"
                        y="8"
                        width="5"
                        height="5"
                        rx="1"
                        fill="currentColor"
                      />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M2 3.5h10M2 7h10M2 10.5h10"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {/* Result count */}
            <span className="text-[12px] text-gray-400 whitespace-nowrap">
              <span className="font-bold text-navy">{total}</span> posts
            </span>
          </div>
        </div>
      </div>

      {/* ══ CONTENT ══════════════════════════════════════════════════════ */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100">
          <SectionLoader text="Loading posts…" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-28 gap-5">
          <div className="w-20 h-20 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect
                x="7"
                y="5"
                width="26"
                height="30"
                rx="3"
                stroke="#D1D5DB"
                strokeWidth="2"
              />
              <path
                d="M13 14h14M13 20h10M13 26h7"
                stroke="#D1D5DB"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="text-center">
            <p className="font-poppins font-bold text-[17px] text-navy">
              No posts found
            </p>
            <p className="text-[13px] text-gray-400 mt-1.5">
              {hasFilters
                ? "Try adjusting your filters or search query"
                : "Create the first community post to get started"}
            </p>
          </div>
          {!hasFilters && (
            <button
              onClick={() => setCreateOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-brand-lighter text-brand-primary text-[13px] font-bold hover:bg-brand-soft transition-colors"
            >
              + Create Post
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-3 gap-5 items-stretch">
          {posts.map((post, idx) => (
            <div
              key={post._id}
              style={{ animationDelay: `${idx * 45}ms` }}
              className="animate-[fadeUp_0.3s_ease_both] flex flex-col"
            >
              <PostCard post={post} onDelete={setDeleteTarget} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {posts.map((post, idx) => (
            <div
              key={post._id}
              style={{ animationDelay: `${idx * 35}ms` }}
              className="animate-[fadeUp_0.25s_ease_both]"
            >
              <PostRow post={post} onDelete={setDeleteTarget} />
            </div>
          ))}
        </div>
      )}

      {/* ══ PAGINATION ═══════════════════════════════════════════════════ */}
      {!loading && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={9}
          onPage={setPage}
        />
      )}

      {/* ── Modals ── */}
      <CreatePostModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={createPost}
        loading={actionLoading}
        categories={categories ?? []}
      />
      <DeletePostModal
        open={!!deleteTarget}
        post={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={actionLoading}
      />
    </div>
  );
}
