import { useState, useMemo } from "react";
import { useDoctors } from "../hooks/useDoctors";
import { filterDoctors, getDoctorSummary } from "../helpers/doctorHelper";
import { Doctor, DoctorFilter } from "../types/doctor.types";
import { SectionLoader } from "../../../components/Loader/Loader";
import DoctorCard from "../components/doctorCard";
import DoctorModal from "../components/doctorModal";
import DoctorDeleteModal from "../components/doctorDeleteModal";
import DoctorFiltersBar from "../components/doctorFilters";
import { useHospitals } from "../../hospital/component/hooks/useHospitals";
import editIcon from "../../../assets/images/edit.png";
import deleteIcon from "../../../assets/images/delete.png";
const DEFAULT_FILTERS: DoctorFilter = {
  search: "",
  specialty: "",
  day: "",
  experience: "",
  minFees: "",
  maxFees: "",
  hospital: "",
  status: "all",
};

type ViewMode = "grid" | "table";

export default function DoctorPage() {
  const {
    doctors,
    loading,
    actionLoading,
    categories,
    addDoctor,
    editDoctor,
    removeDoctor,
    toggleStatus,
  } = useDoctors();
  const { hospitals } = useHospitals();
  const [filters, setFilters] = useState<DoctorFilter>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Doctor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Doctor | null>(null);

  const filtered = useMemo(
    () => filterDoctors(doctors, filters),
    [doctors, filters],
  );
  const summary = useMemo(() => getDoctorSummary(doctors), [doctors]);

  const openAdd = () => {
    setEditTarget(null);
    setModalOpen(true);
  };
  const openEdit = (d: Doctor) => {
    setEditTarget(d);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
  };
  const merge = (p: Partial<DoctorFilter>) =>
    setFilters((f) => ({ ...f, ...p }));

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const ok = await removeDoctor(deleteTarget);
    if (ok) setDeleteTarget(null);
  };

  const summaryCards = [
    {
      label: "Total Doctors",
      value: summary.total,
      icon: "🩺",
      color: "from-brand-primary/10 to-brand-primary/5",
      text: "text-brand-primary",
      border: "border-brand-primary/15",
    },
    {
      label: "Active",
      value: summary.active,
      icon: "✅",
      color: "from-success/10 to-success/5",
      text: "text-green-600",
      border: "border-success/20",
    },
    {
      label: "Inactive",
      value: summary.inactive,
      icon: "⛔",
      color: "from-gray-100 to-gray-50",
      text: "text-gray-400",
      border: "border-gray-200",
    },
    {
      label: "Avg. Rating",
      value: `⭐ ${summary.avgRating}`,
      icon: "⭐",
      color: "from-warning/10 to-warning/5",
      text: "text-warning",
      border: "border-warning/20",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-poppins font-bold text-2xl text-navy tracking-tight">
            Doctors
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Manage doctor profiles, availability and consultations
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {/* View toggle */}
          <div className="flex bg-white border border-brand-primary/[0.08] rounded-xl p-0.5 gap-0.5">
            {(["grid", "table"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all
                  ${viewMode === v ? "bg-surface text-brand-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
              >
                {v === "grid" ? "⊞" : "☰"}
              </button>
            ))}
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-gradient text-white text-[13.5px] font-semibold shadow-btn hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
          >
            <span className="text-lg leading-none">+</span> Add Doctor
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {summaryCards.map((s) => (
          <div
            key={s.label}
            className={`bg-gradient-to-br ${s.color} border ${s.border} rounded-2xl p-4 flex items-center gap-3`}
          >
            <div className="w-11 h-11 rounded-xl bg-white/70 flex items-center justify-center text-xl shadow-sm">
              {s.icon}
            </div>
            <div>
              <p className={`font-poppins font-extrabold text-2xl ${s.text}`}>
                {s.value}
              </p>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <DoctorFiltersBar
        filters={filters}
        onChange={merge}
        onReset={() => setFilters(DEFAULT_FILTERS)}
        specialties={categories}
        hospitals={hospitals}
        totalShown={filtered.length}
        total={doctors.length}
      />

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-brand-primary/[0.08]">
          <SectionLoader text="Fetching doctors…" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-brand-primary/[0.08] flex flex-col items-center justify-center py-20 gap-3">
          <span className="text-5xl">🩺</span>
          <p className="font-poppins font-bold text-navy text-[15px]">
            No doctors found
          </p>
          <p className="text-sm text-gray-400">
            Try adjusting your filters or search
          </p>
          <button
            onClick={openAdd}
            className="mt-2 px-5 py-2 rounded-xl bg-brand-lighter text-brand-primary text-[13px] font-semibold hover:bg-brand-soft transition-colors"
          >
            + Add your first doctor
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-3 gap-5">
          {filtered.map((d, i) => (
            <DoctorCard
              key={d._id}
              doctor={d}
              index={i}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onToggle={toggleStatus}
            />
          ))}
        </div>
      ) : (
        /* Table view */
        <div className="bg-white rounded-2xl border border-brand-primary/[0.08] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface border-b border-brand-primary/[0.07]">
                {[
                  "Doctor",
                  "Specialization",
                  "Hospital",
                  "Experience",
                  "Fee",
                  "Availability",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-widest text-gray-300"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr
                  key={d._id}
                  style={{ animationDelay: `${i * 40}ms` }}
                  className="border-b border-brand-primary/[0.05] last:border-0 hover:bg-surface/60 transition-colors group animate-[fadeUp_0.3s_ease_both]"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      {d.profileImage ? (
                        <img
                          src={d.profileImage}
                          alt={d.name}
                          className="w-9 h-9 rounded-xl object-cover border border-brand-primary/10 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-brand-lighter flex items-center justify-center text-base flex-shrink-0">
                          🩺
                        </div>
                      )}
                      <div>
                        <p className="text-[13px] font-bold text-navy leading-none">
                          {d.name}
                        </p>
                        <p className="text-[10.5px] text-gray-300 mt-0.5 font-mono">
                          {d._id.slice(-8)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[12.5px] text-gray-600 font-medium">
                    {d.specialization.name}
                  </td>
                  <td className="px-4 py-3.5 text-[12.5px] text-gray-500">
                    {d.hospital.name}
                  </td>
                  <td className="px-4 py-3.5 text-[12.5px] text-gray-600 font-semibold">
                    {d.experienceYears} yrs
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`text-[12px] font-bold ${d.isFree ? "text-green-600" : "text-brand-primary"}`}
                    >
                      {d.isFree ? "Free" : `₹${d.consultationFee}`}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {d.availability.slice(0, 3).map((a) => (
                        <span
                          key={a._id}
                          className="px-1.5 py-0.5 bg-surface text-[10px] font-semibold text-gray-500 rounded capitalize"
                        >
                          {a.day.slice(0, 3)}
                        </span>
                      ))}
                      {d.availability.length > 3 && (
                        <span className="px-1.5 py-0.5 bg-surface text-[10px] font-semibold text-gray-400 rounded">
                          +{d.availability.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      // onClick={() => toggleStatus(d)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-not-allowed
                        ${d.isActive ? "bg-success-bg text-green-700" : "bg-gray-100 text-gray-400"}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${d.isActive ? "bg-green-500" : "bg-gray-300"}`}
                      />
                      {d.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(d)}
                        className="w-8 h-8 rounded-lg hover:bg-brand-lighter hover:text-brand-primary text-gray-400 flex items-center justify-center text-sm transition-all"
                      >
                        <img
                          src={editIcon}
                          alt="edit"
                          className="w-3.5 h-3.5 opacity-70"
                        />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(d)}
                        className="w-8 h-8 rounded-lg hover:bg-danger-bg hover:text-danger text-gray-400 flex items-center justify-center text-sm transition-all"
                      >
                        <img
                          src={deleteIcon}
                          alt="delete"
                          className="w-3.5 h-3.5 opacity-70"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <DoctorModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={
          editTarget ? (form) => editDoctor(editTarget._id, form) : addDoctor
        }
        initialData={editTarget}
        loading={actionLoading}
        specialties={categories}
        hospitals={hospitals}
      />
      <DoctorDeleteModal
        open={!!deleteTarget}
        doctor={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={actionLoading}
      />
    </div>
  );
}
