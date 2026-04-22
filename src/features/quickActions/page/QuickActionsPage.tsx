import { useEffect, useState } from "react";
import { useQuickActions } from "../hooks/useQuickActions";
import { QuickAction, QuickActionFormValues } from "../types/quickAction.types";
import { formFromQuickAction } from "../helpers/quickActionHelper";
import QuickActionCard from "../components/QuickActionCard";
import QuickActionModal from "../components/QuickActionModal";
import QuickActionDeleteModal from "../components/QuickActionDeleteModal";
import { QUICK_ACTIONS } from "../../../utils/constants";

export default function QuickActionsPage(props: any) {
  const { staticActions } = props;

  const {
    quickActions,
    loading,
    actionLoading,
    fetchAll,
    getQuickActionById,
    addQuickAction,
    editQuickAction,
    removeQuickAction,
  } = useQuickActions();

  // ── Modal state ────────────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<QuickAction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QuickAction | null>(null);

  useEffect(() => {
    if (!staticActions) {
      fetchAll();
    }
  }, [fetchAll, staticActions]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEdit = async (qa: QuickAction) => {
    setModalOpen(true);
    const latest = await getQuickActionById(qa._id);
    if (latest) {
      setEditTarget(latest);
    } else {
      setEditTarget(qa);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
  };

  const handleSubmit = async (vals: QuickActionFormValues) => {
    let ok = false;
    if (editTarget) {
      ok = await editQuickAction(editTarget._id, vals);
    } else {
      ok = await addQuickAction(vals);
    }
    if (ok) closeModal();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const ok = await removeQuickAction(deleteTarget._id, deleteTarget.title);
    if (ok) setDeleteTarget(null);
  };

  // ── Skeleton ───────────────────────────────────────────────────────────────
  const SkeletonCard = () => (
    <div className="bg-surface rounded-xl border border-brand-primary/[0.06] overflow-hidden animate-pulse">
      <div className="h-0.5 bg-gray-100" />
      <div className="p-4 flex flex-col items-center gap-2.5">
        <div className="w-12 h-12 rounded-xl bg-gray-100" />
        <div className="h-2.5 w-16 rounded-full bg-gray-100" />
      </div>
    </div>
  );

  const displayedActions: QuickAction[] = staticActions
    ? QUICK_ACTIONS.map((a, i) => ({
        _id: `static-${i}`,
        title: a.name, // using name from constants
        icon: a.image, // using image from constants
        path: a.path,
        isStatic: true,
        createdAt: "",
        updatedAt: "",
      }))
    : quickActions;

  return (
    <>
      {/* ── Outer card ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-brand-primary/[0.08] shadow-sm">
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-[14px]">⚡</span>
            <h3 className="font-poppins font-bold text-[14px] text-navy leading-none">
              Quick Actions
            </h3>
            {!loading && !staticActions && (
              <span className="px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-semibold">
                {quickActions.length}
              </span>
            )}
          </div>

          {!staticActions && (
            <button
              onClick={openAdd}
              className="
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                bg-gradient-to-r from-brand-primary to-brand-gradient
                text-white text-[11px] font-semibold
                hover:opacity-90 hover:shadow-sm hover:-translate-y-0.5
                active:scale-[0.97]
                transition-all duration-200
              "
            >
              <span className="text-[12px] leading-none">＋</span>
              Add Quick Action
            </button>
          )}
        </div>

        {/* Card body */}
        <div className="px-4 pb-4 pt-2">
          {loading && !staticActions ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : displayedActions.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-2xl">
                ⚡
              </div>
              <div className="text-center">
                <p className="font-poppins font-semibold text-[13px] text-navy">
                  No Quick Actions Yet
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Add your first quick action to get started.
                </p>
              </div>
              {!staticActions && (
                <button
                  onClick={openAdd}
                  className="mt-1 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-primary to-brand-gradient text-white text-[11px] font-semibold hover:opacity-90 transition-all"
                >
                  + Add Quick Action
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 overflow-visible pt-3 px-1">
              {displayedActions.map((qa, index) => (
                <QuickActionCard
                  key={qa._id}
                  action={qa}
                  index={index}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals (outside card so they overlay correctly) ────────────────── */}
      <QuickActionModal
        open={modalOpen}
        editData={editTarget ? formFromQuickAction(editTarget) : null}
        loading={actionLoading}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      <QuickActionDeleteModal
        open={!!deleteTarget}
        action={deleteTarget}
        loading={actionLoading}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
