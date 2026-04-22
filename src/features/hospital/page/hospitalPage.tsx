import { useState, useEffect, useRef } from "react";
import { useHospitals } from "../../hospital/component/hooks/useHospitals";
import { Hospital } from "../../hospital/component/types/hospital.types";
import { SectionLoader } from "../../../components/Loader/Loader";
import HospitalModal from "../../hospital/component/hospitalModal";
import HospitalDeleteModal from "../../hospital/component/hospitalDeleteModal";
import HospitalCard from "../../hospital/component/hospitalCard";
import { formatHospitalDate } from "../../hospital/component/hospitalHelpers";
import searchIcon from "../../../assets/images/search.png";
import locationIcon from "../../../assets/images/location.png";
import editIcon from "../../../assets/images/edit.png";
import deleteIcon from "../../../assets/images/delete.png";
import hospitalsIcon from "../../../assets/images/hospital.png";
import { toTitleCase } from "../../../features/doctors/helpers/doctorHelper";

type FilterStatus = "all" | "active" | "inactive";
type ViewMode = "table" | "grid";

function ActiveBadge({
  active,
  onClick,
}: {
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title="Click to toggle status"
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold
        ${active ? "bg-success-bg text-green-700" : "bg-gray-100 text-gray-400"}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${active ? "bg-green-500" : "bg-gray-300"}`}
      />
      {active ? "Active" : "Inactive"}
    </button>
  );
}

function ActionBtn({
  children,
  title,
  color,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  color: "blue" | "red";
  onClick: () => void;
}) {
  const colors = {
    blue: "hover:bg-brand-lighter hover:text-brand-primary",
    red: "hover:bg-danger-bg hover:text-danger",
  };
  return (
    <button
      title={title}
      onClick={onClick}
      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm text-gray-400 transition-all ${colors[color]}`}
    >
      {children}
    </button>
  );
}

export default function HospitalPage() {
  const {
    hospitals,
    counts,
    loading,
    actionLoading,
    pagination,
    fetchAll,
    addHospital,
    editHospital,
    removeHospital,
    toggleStatus,
  } = useHospitals();

  const [search, setSearch] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editTarget, setEditTarget] = useState<Hospital | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Hospital | null>(null);

  const searchRef = useRef<any>(null);

  // Sync to server-side filtering
  useEffect(() => {
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      fetchAll(1, 10, { search, status: filterStatus });
    }, 400);

    return () => {
      if (searchRef.current) clearTimeout(searchRef.current);
    };
  }, [search, filterStatus, fetchAll]);

  const handlePageChange = (p: number) => {
    fetchAll(p, 10, { search, status: filterStatus });
  };

  const openAdd = () => {
    setEditTarget(null);
    setModalOpen(true);
  };
  const openEdit = (h: Hospital) => {
    setEditTarget(h);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const ok = await removeHospital(deleteTarget);
    if (ok) setDeleteTarget(null);
  };
  const summaryCards = [
    {
      label: "Total Hospitals",
      value: counts.total,
      icon: "🏥",
      color: "from-brand-primary/10 to-brand-primary/5",
      text: "text-brand-primary",
      border: "border-brand-primary/15",
    },
    {
      label: "Active",
      value: counts.active,
      icon: "✅",
      color: "from-success/10 to-success/5",
      text: "text-green-600",
      border: "border-success/20",
    },
    {
      label: "Inactive",
      value: counts.inactive,
      icon: "⛔",
      color: "from-gray-100 to-gray-50",
      text: "text-gray-400",
      border: "border-gray-200",
    },
  ];
  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-poppins font-bold text-2xl text-navy tracking-tight">
            Hospitals
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Manage hospital network — add, edit, and monitor all facilities
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-gradient text-white text-[13.5px] font-semibold shadow-btn hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
        >
          <span className="text-lg leading-none">+</span> Add Hospital
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {summaryCards.map((s) => (
          <div
            key={s.label}
            className={`bg-gradient-to-br ${s.color} border ${s.border} rounded-2xl p-5 flex items-center gap-4`}
          >
            <div className="w-12 h-12 rounded-xl bg-white/70 flex items-center justify-center text-2xl shadow-sm">
              {s.icon}
            </div>
            <div>
              <p className={`font-poppins font-extrabold text-3xl ${s.text}`}>
                {s.value}
              </p>
              <p className="text-[12px] text-gray-500 font-medium mt-0.5">
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>
      {/* ── Toolbar ── */}
      <div className="bg-white rounded-2xl border border-brand-primary/[0.08] px-5 py-3.5 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <img
            src={searchIcon}
            alt="Search"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-70"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, address, email…"
            className="w-full h-9 pl-8 pr-4 border border-black/10 rounded-xl text-[13px] font-medium text-navy placeholder:text-gray-300 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 text-sm"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex bg-surface rounded-xl p-0.5 gap-0.5">
          {(["all", "active", "inactive"] as FilterStatus[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-all
                ${filterStatus === f ? "bg-white text-brand-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex bg-surface rounded-xl p-0.5 gap-0.5">
          {(["table", "grid"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all
                ${viewMode === v ? "bg-white text-brand-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
            >
              {v === "table" ? "☰" : "⊞"}
            </button>
          ))}
        </div>

        <span className="text-[12px] text-gray-300 font-medium ml-auto">
          {hospitals.length} of {pagination.total} hospitals
        </span>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-brand-primary/[0.08]">
          <SectionLoader text="Fetching hospitals…" />
        </div>
      ) : hospitals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-brand-primary/[0.08] flex flex-col items-center justify-center py-20 gap-3">
          <img
            src={hospitalsIcon}
            alt={"hospitals"}
            className="w-10 h-10 flex-shrink-0 object-contain opacity-90 group-hover:opacity-90 transition-opacity"
          />
          <p className="font-poppins font-bold text-navy text-[15px]">
            No hospitals found
          </p>
          <p className="text-sm text-gray-400">
            Try adjusting your search or filter
          </p>
          <button
            onClick={openAdd}
            className="mt-2 px-5 py-2 rounded-xl bg-brand-lighter text-brand-primary text-[13px] font-semibold hover:bg-brand-soft transition-colors"
          >
            + Add your first hospital
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* ── Table ── */
        <div className="bg-white rounded-2xl border border-brand-primary/[0.08] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface border-b border-brand-primary/[0.07]">
                {[
                  "Hospital",
                  "Address",
                  "Contact",
                  "Coordinates",
                  "Status",
                  "Added",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-gray-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hospitals.map((h, i) => (
                <tr
                  key={h._id}
                  style={{ animationDelay: `${i * 40}ms` }}
                  className="border-b border-brand-primary/[0.05] last:border-0 hover:bg-surface/60 transition-colors group animate-[fadeUp_0.3s_ease_both]"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 border border-brand-primary/10 flex items-center justify-center text-lg flex-shrink-0">
                        <img
                          src={hospitalsIcon}
                          alt={"hospitals"}
                          className="w-5 h-5 flex-shrink-0 object-contain opacity-90 group-hover:opacity-90 transition-opacity"
                        />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-navy leading-none">
                          {toTitleCase(h.name)}
                        </p>
                        <p className="text-[10.5px] text-gray-300 mt-0.5 font-mono">
                          {h._id.slice(-8)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[12.5px] text-gray-500 font-medium">
                    {h.address}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-[12.5px] text-gray-600 font-medium">
                      {h.phone}
                    </p>
                    <p className="text-[11px] text-gray-300 mt-0.5">
                      {h.email}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-[11.5px] text-gray-400 font-mono">
                    <div className="flex items-center gap-1.5">
                      <img
                        src={locationIcon}
                        alt="location"
                        className="w-3 h-3 opacity-70 flex-shrink-0"
                      />
                      {h.location.coordinates[1].toFixed(4)},{" "}
                      {h.location.coordinates[0].toFixed(4)}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <ActiveBadge
                      active={h.isActive}
                      onClick={() => toggleStatus(h)}
                    />
                  </td>
                  <td className="px-5 py-3.5 text-[12px] text-gray-400">
                    {formatHospitalDate(h.createdAt)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ActionBtn
                        title="Edit"
                        color="blue"
                        onClick={() => openEdit(h)}
                      >
                        <img
                          src={editIcon}
                          alt="edit"
                          className="w-3.5 h-3.5 opacity-70"
                        />
                      </ActionBtn>
                      <ActionBtn
                        title="Delete"
                        color="red"
                        onClick={() => setDeleteTarget(h)}
                      >
                        <img
                          src={deleteIcon}
                          alt="delete"
                          className="w-3.5 h-3.5 opacity-70"
                        />
                      </ActionBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── Grid ── */
        <div className="grid grid-cols-3 gap-5">
          {hospitals.map((h, i) => (
            <HospitalCard
              key={h._id}
              hospital={h}
              index={i}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && (pagination.total > 0 || hospitals.length > 0) && (
        <div className="flex items-center justify-between bg-white rounded-2xl border border-brand-primary/[0.08] px-5 py-3 mt-6">
          <span className="text-[12px] text-gray-400 font-medium">
            Page {pagination.page || 1} of {pagination.totalPages || 1}{" "}
            &nbsp;·&nbsp; {pagination.total || hospitals.length} total hospitals
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(1)}
              disabled={pagination.page === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] text-gray-400 hover:bg-surface hover:text-brand-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              «
            </button>
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] text-gray-400 hover:bg-surface hover:text-brand-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              ‹
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === pagination.totalPages ||
                  Math.abs(p - (pagination.page || 1)) <= 1,
              )
              .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1)
                  acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "…" ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-8 h-8 flex items-center justify-center text-[12px] text-gray-300"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p as number)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-semibold transition-all
                      ${pagination.page === p ? "bg-brand-primary text-white shadow-sm" : "text-gray-500 hover:bg-surface hover:text-brand-primary"}`}
                  >
                    {p}
                  </button>
                ),
              )}
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] text-gray-400 hover:bg-surface hover:text-brand-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              ›
            </button>
            <button
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] text-gray-400 hover:bg-surface hover:text-brand-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              »
            </button>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <HospitalModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={
          editTarget
            ? (form) => editHospital(editTarget._id, form)
            : addHospital
        }
        initialData={editTarget}
        loading={actionLoading}
      />
      <HospitalDeleteModal
        open={!!deleteTarget}
        hospital={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={actionLoading}
      />
    </div>
  );
}
