// import { useState, useMemo } from "react";
// import { usePatients } from "../hooks/usePatients";
// import {
//   filterPatients,
//   getPatientSummary,
//   calcAge,
// } from "../helpers/patientHelper";
// import { Patient, PatientFilter } from "../types/patient.types";
// import { SectionLoader } from "../../../components/Loader/Loader";
// import PatientFilters from "../components/patientFilters";
// import PatientModal from "../components/patientModal";
// import PatientDeleteModal from "../components/patientDeleteModal";
// import editIcon from "../../../assets/images/edit.png";
// import deleteIcon from "../../../assets/images/delete.png";
// import { capitalize } from "../../../utils/helpers";
// import userIcon from "../../../assets/images/user.png";
// import locationIcon from "../../../assets/images/location.png";
// const DEFAULT_FILTERS: PatientFilter = {
//   search: "",
//   gender: "",
//   bloodGroup: "",
//   status: "all",
// };

// const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
// type ViewMode = "table" | "grid";

// const genderIcon = (g: string) =>
//   g === "male" ? "👨" : g === "female" ? "👩" : "🧑";

// /* ── Pagination ─────────────────────────────────────────────────────── */
// function Pagination({
//   total,
//   page,
//   pageSize,
//   onPage,
//   onPageSize,
// }: {
//   total: number;
//   page: number;
//   pageSize: number;
//   onPage: (p: number) => void;
//   onPageSize: (s: number) => void;
// }) {
//   const totalPages = Math.ceil(total / pageSize);
//   if (total === 0) return null;

//   const from = (page - 1) * pageSize + 1;
//   const to = Math.min(page * pageSize, total);

//   const getPages = (): (number | "...")[] => {
//     if (totalPages <= 7)
//       return Array.from({ length: totalPages }, (_, i) => i + 1);
//     if (page <= 4) return [1, 2, 3, 4, 5, "...", totalPages];
//     if (page >= totalPages - 3)
//       return [
//         1,
//         "...",
//         totalPages - 4,
//         totalPages - 3,
//         totalPages - 2,
//         totalPages - 1,
//         totalPages,
//       ];
//     return [1, "...", page - 1, page, page + 1, "...", totalPages];
//   };

//   return (
//     <div className="flex items-center justify-between px-4 py-3.5 bg-white border-t border-brand-primary/[0.07]">
//       <div className="flex items-center gap-3">
//         <p className="text-[12.5px] text-gray-400 font-medium">
//           Showing{" "}
//           <span className="text-navy font-bold">
//             {from}–{to}
//           </span>{" "}
//           of <span className="text-navy font-bold">{total}</span> patients
//         </p>
//         <div className="flex items-center gap-1.5">
//           <span className="text-[12px] text-gray-400">Per page:</span>
//           <select
//             value={pageSize}
//             onChange={(e) => {
//               onPageSize(Number(e.target.value));
//               onPage(1);
//             }}
//             className="h-7 border border-black/10 rounded-lg px-2 text-[12px] font-semibold text-navy outline-none focus:border-brand-primary bg-surface"
//           >
//             {PAGE_SIZE_OPTIONS.map((s) => (
//               <option key={s} value={s}>
//                 {s}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       <div className="flex items-center gap-1">
//         <button
//           onClick={() => onPage(page - 1)}
//           disabled={page === 1}
//           className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] text-gray-400 hover:bg-surface hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed transition-all"
//         >
//           ‹
//         </button>

//         {getPages().map((p, i) =>
//           p === "..." ? (
//             <span
//               key={`e-${i}`}
//               className="w-8 h-8 flex items-center justify-center text-[12px] text-gray-300"
//             >
//               …
//             </span>
//           ) : (
//             <button
//               key={p}
//               onClick={() => onPage(p as number)}
//               className={`w-8 h-8 rounded-lg text-[12.5px] font-semibold transition-all
//                 ${page === p ? "bg-brand-primary text-white shadow-sm" : "text-gray-500 hover:bg-surface hover:text-navy"}`}
//             >
//               {p}
//             </button>
//           ),
//         )}

//         <button
//           onClick={() => onPage(page + 1)}
//           disabled={page === totalPages}
//           className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] text-gray-400 hover:bg-surface hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed transition-all"
//         >
//           ›
//         </button>
//       </div>
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════════════════════════════
//    PAGE
// ══════════════════════════════════════════════════════════════════════ */
// export default function PatientPage() {
//   const {
//     patients,
//     loading,
//     actionLoading,
//     addPatient,
//     editPatient,
//     removePatient,
//   } = usePatients();

//   const [filters, setFilters] = useState<PatientFilter>(DEFAULT_FILTERS);
//   const [viewMode, setViewMode] = useState<ViewMode>("table");
//   const [modalOpen, setModalOpen] = useState(false);
//   const [editTarget, setEditTarget] = useState<Patient | null>(null);
//   const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);

//   const filtered = useMemo(
//     () => filterPatients(patients, filters),
//     [patients, filters],
//   );
//   const paginated = useMemo(
//     () => filtered.slice((page - 1) * pageSize, page * pageSize),
//     [filtered, page, pageSize],
//   );
//   const summary = useMemo(() => getPatientSummary(patients), [patients]);

//   const merge = (p: Partial<PatientFilter>) => {
//     setFilters((f) => ({ ...f, ...p }));
//     setPage(1);
//   };

//   const openAdd = () => {
//     setEditTarget(null);
//     setModalOpen(true);
//   };
//   const openEdit = (p: Patient) => {
//     setEditTarget(p);
//     setModalOpen(true);
//   };
//   const closeModal = () => {
//     setModalOpen(false);
//     setEditTarget(null);
//   };

//   const handleDelete = async () => {
//     if (!deleteTarget) return;
//     const ok = await removePatient(deleteTarget);
//     if (ok) setDeleteTarget(null);
//   };

//   const summaryCards = [
//     {
//       label: "Total Patients",
//       value: summary.total,
//       icon: "👥",
//       color: "from-brand-primary/10 to-brand-primary/5",
//       text: "text-brand-primary",
//       border: "border-brand-primary/15",
//     },
//     {
//       label: "Male",
//       value: summary.male,
//       icon: "👨",
//       color: "from-blue-50 to-blue-50/50",
//       text: "text-blue-600",
//       border: "border-blue-200",
//     },
//     {
//       label: "Female",
//       value: summary.female,
//       icon: "👩",
//       color: "from-pink-50 to-pink-50/50",
//       text: "text-pink-500",
//       border: "border-pink-200",
//     },
//     {
//       label: "Active Patients",
//       value: summary.active,
//       icon: "🟢",
//       color: "from-success/10 to-success/5",
//       text: "text-green-600",
//       border: "border-success/20",
//     },
//   ];

//   return (
//     <div className="flex flex-col gap-6">
//       {/* Header */}
//       <div className="flex items-start justify-between">
//         <div>
//           <h2 className="font-poppins font-bold text-2xl text-navy tracking-tight">
//             Patients
//           </h2>
//           <p className="text-sm text-gray-400 mt-1">
//             Manage patient records and medical profiles
//           </p>
//         </div>
//         <div className="flex items-center gap-2.5">
//           <div className="flex bg-white border border-brand-primary/[0.08] rounded-xl p-0.5 gap-0.5">
//             {(["table", "grid"] as ViewMode[]).map((v) => (
//               <button
//                 key={v}
//                 onClick={() => setViewMode(v)}
//                 className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all
//                   ${viewMode === v ? "bg-surface text-brand-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
//               >
//                 {v === "table" ? "☰" : "⊞"}
//               </button>
//             ))}
//           </div>
//           <button
//             onClick={openAdd}
//             className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-gradient text-white text-[13.5px] font-semibold shadow-btn hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
//           >
//             <span className="text-lg leading-none">+</span> Add Patient
//           </button>
//         </div>
//       </div>

//       {/* Summary cards */}
//       <div className="grid grid-cols-4 gap-4">
//         {summaryCards.map((s) => (
//           <div
//             key={s.label}
//             className={`bg-gradient-to-br ${s.color} border ${s.border} rounded-2xl p-4 flex items-center gap-3`}
//           >
//             <div className="w-11 h-11 rounded-xl bg-white/70 flex items-center justify-center text-xl shadow-sm">
//               {s.icon}
//             </div>
//             <div>
//               <p className={`font-poppins font-extrabold text-2xl ${s.text}`}>
//                 {s.value}
//               </p>
//               <p className="text-[11px] text-gray-500 font-medium mt-0.5">
//                 {s.label}
//               </p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Filters */}
//       <PatientFilters
//         filters={filters}
//         onChange={merge}
//         onReset={() => {
//           setFilters(DEFAULT_FILTERS);
//           setPage(1);
//         }}
//         totalShown={filtered.length}
//         total={patients.length}
//       />

//       {/* Content */}
//       {loading ? (
//         <div className="bg-white rounded-2xl border border-brand-primary/[0.08]">
//           <SectionLoader text="Fetching patient records…" />
//         </div>
//       ) : filtered.length === 0 ? (
//         <div className="bg-white rounded-2xl border border-brand-primary/[0.08] flex flex-col items-center justify-center py-20 gap-3">
//           <span className="text-5xl">👥</span>
//           <p className="font-poppins font-bold text-navy text-[15px]">
//             No patients found
//           </p>
//           <p className="text-sm text-gray-400">
//             Try adjusting filters or register a new patient
//           </p>
//           <button
//             onClick={openAdd}
//             className="mt-2 px-5 py-2 rounded-xl bg-brand-lighter text-brand-primary text-[13px] font-semibold hover:bg-brand-soft transition-colors"
//           >
//             + Register Patient
//           </button>
//         </div>
//       ) : viewMode === "table" ? (
//         /* ── Table ── */
//         <div className="bg-white rounded-2xl border border-brand-primary/[0.08] overflow-hidden">
//           <table className="w-full text-left">
//             <thead>
//               <tr className="bg-surface border-b border-brand-primary/[0.07]">
//                 {[
//                   "Patient",
//                   "Phone",
//                   "Age / Gender",
//                   "Blood",
//                   "NFC Card",
//                   "Location",
//                   "Joined",
//                   "Actions",
//                 ].map((h) => (
//                   <th
//                     key={h}
//                     className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-widest text-gray-300"
//                   >
//                     {h}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {paginated.map((p, i) => (
//                 <tr
//                   key={p._id}
//                   style={{ animationDelay: `${i * 35}ms` }}
//                   className="border-b border-brand-primary/[0.05] last:border-0 hover:bg-surface/60 transition-colors group animate-[fadeUp_0.3s_ease_both]"
//                 >
//                   {/* Patient */}
//                   <td className="px-4 py-3.5">
//                     <div className="flex items-center gap-2.5">
//                       <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-brand-lighter flex items-center justify-center">
//                         {p.avatar ? (
//                           <img
//                             src={p.avatar}
//                             alt={p.name}
//                             className="w-full h-full object-cover"
//                           />
//                         ) : (
//                           <img
//                             src={userIcon}
//                             alt={p.name}
//                             className="w-5 h-5 object-contain opacity-40"
//                           />
//                           // <span className="text-base">
//                           //   {genderIcon(p.gender)}
//                           // </span>
//                         )}
//                       </div>
//                       <div>
//                         <p className="text-[13px] font-bold text-navy leading-none">
//                           {p.name}
//                         </p>
//                         <div className="flex items-center gap-1.5 mt-0.5">
//                           <p className="text-[11px] text-gray-400 truncate max-w-[120px]">
//                             {p.email}
//                           </p>
//                           <span
//                             className={`w-1.5 h-1.5 rounded-full ${p.isActive !== false ? "bg-success shadow-[0_0_5px_rgba(22,163,74,0.5)]" : "bg-gray-300"}`}
//                             title={p.isActive !== false ? "Active" : "Inactive"}
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   </td>

//                   {/* Phone */}
//                   <td className="px-4 py-3.5 text-[12.5px] text-gray-600 font-medium">
//                     {p.phone}
//                   </td>

//                   {/* Age / Gender */}
//                   <td className="px-4 py-3.5">
//                     <p className="text-[12.5px] text-gray-600 font-semibold">
//                       {calcAge(p.dob)} yrs
//                     </p>
//                     <p className="text-[11px] text-gray-400 capitalize">
//                       {p.gender}
//                     </p>
//                   </td>

//                   {/* Blood */}
//                   <td className="px-4 py-3.5">
//                     {p.bloodGroup ? (
//                       <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-danger-bg text-danger text-[12px] font-bold">
//                         🩸 {p.bloodGroup}
//                       </span>
//                     ) : (
//                       <span className="text-[12px] text-gray-300">—</span>
//                     )}
//                   </td>

//                   {/* NFC */}
//                   <td className="px-4 py-3.5">
//                     <span className="font-mono text-[11.5px] text-gray-500 bg-surface px-2 py-1 rounded-lg">
//                       {p.nfcCardNumber || "—"}
//                     </span>
//                   </td>

//                   {/* Location */}
//                   <td className="px-4 py-3.5">
//                     {p.location?.coordinates?.[0] &&
//                     p.location?.coordinates?.[1] ? (
//                       <a
//                         href={`https://www.google.com/maps?q=${p.location.coordinates[1]},${p.location.coordinates[0]}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="flex flex-col gap-0.5 group/loc w-fit"
//                       >
//                         <span className="font-mono text-[11px] text-gray-500 bg-surface px-2 py-0.5 rounded-lg group-hover/loc:bg-brand-lighter group-hover/loc:text-brand-primary transition-colors">
//                           {p.location.coordinates[1].toFixed(4)}°N
//                         </span>
//                         <span className="font-mono text-[11px] text-gray-500 bg-surface px-2 py-0.5 rounded-lg group-hover/loc:bg-brand-lighter group-hover/loc:text-brand-primary transition-colors">
//                           {p.location.coordinates[0].toFixed(4)}°E
//                         </span>
//                       </a>
//                     ) : (
//                       <span className="text-[12px] text-gray-300">—</span>
//                     )}
//                   </td>

//                   {/* Joined */}
//                   <td className="px-4 py-3.5 text-[12px] text-gray-400">
//                     {new Date(p.createdAt).toLocaleDateString("en-IN", {
//                       day: "2-digit",
//                       month: "short",
//                       year: "numeric",
//                     })}
//                   </td>

//                   {/* Actions */}
//                   <td className="px-4 py-3.5">
//                     <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                       <button
//                         onClick={() => openEdit(p)}
//                         className="w-8 h-8 rounded-lg hover:bg-brand-lighter flex items-center justify-center transition-all"
//                       >
//                         <img
//                           src={editIcon}
//                           alt="edit"
//                           className="w-3.5 h-3.5 opacity-70"
//                         />
//                       </button>
//                       <button
//                         onClick={() => setDeleteTarget(p)}
//                         className="w-8 h-8 rounded-lg hover:bg-danger-bg flex items-center justify-center transition-all"
//                       >
//                         <img
//                           src={deleteIcon}
//                           alt="delete"
//                           className="w-3.5 h-3.5 opacity-70"
//                         />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           <Pagination
//             total={filtered.length}
//             page={page}
//             pageSize={pageSize}
//             onPage={setPage}
//             onPageSize={setPageSize}
//           />
//         </div>
//       ) : (
//         /* ── Grid ── */
//         <div className="flex flex-col gap-5">
//           <div className="grid grid-cols-3 gap-5">
//             {paginated.map((p, i) => (
//               <div
//                 key={p._id}
//                 style={{ animationDelay: `${i * 55}ms` }}
//                 className="bg-white rounded-2xl border border-brand-primary/[0.08] overflow-hidden hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200 animate-[fadeUp_0.35s_ease_both] group"
//               >
//                 <div className="h-1.5 bg-gradient-to-r from-brand-primary to-brand-gradient" />

//                 <div className="p-5">
//                   {/* Avatar + name */}
//                   <div className="flex items-start gap-3 mb-4">
//                     <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-brand-lighter flex items-center justify-center border border-brand-primary/10">
//                       {p.avatar ? (
//                         <img
//                           src={p.avatar}
//                           alt={p.name}
//                           className="w-full h-full object-cover"
//                         />
//                       ) : (
//                         <img
//                           src={userIcon}
//                           alt={p.name}
//                           className="w-8 h-8 object-contain opacity-40"
//                         />
//                       )}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center gap-2">
//                         <p className="font-poppins font-bold text-[13.5px] text-navy leading-tight truncate">
//                           {capitalize(p.name)}
//                         </p>
//                         <span
//                           className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${p.isActive !== false ? "bg-success" : "bg-gray-300"}`}
//                         />
//                       </div>
//                       <p className="text-[11.5px] text-gray-400 mt-0.5 truncate">
//                         {p.email}
//                       </p>
//                       <p className="text-[11px] text-gray-400 mt-0.5">
//                         {p.phone}
//                       </p>
//                     </div>
//                     {p.bloodGroup && (
//                       <span className="flex-shrink-0 text-[11px] font-bold text-danger bg-danger-bg px-2 py-1 rounded-lg">
//                         🩸 {p.bloodGroup}
//                       </span>
//                     )}
//                   </div>

//                   {/* Stats */}
//                   <div className="grid grid-cols-3 gap-2 border-t border-brand-primary/[0.07] pt-3.5 mb-4 text-center">
//                     <div>
//                       <p className="font-poppins font-bold text-[13px] text-navy">
//                         {calcAge(p.dob)}
//                       </p>
//                       <p className="text-[10px] text-gray-400 mt-0.5">Age</p>
//                     </div>
//                     <div>
//                       <p className="font-poppins font-bold text-[13px] text-navy capitalize">
//                         {p.gender}
//                       </p>
//                       <p className="text-[10px] text-gray-400 mt-0.5">Gender</p>
//                     </div>
//                     <div>
//                       <p className="font-poppins font-bold text-[13px] text-navy">
//                         {p.height ? `${p.height}ft` : "—"}
//                       </p>
//                       <p className="text-[10px] text-gray-400 mt-0.5">Height</p>
//                     </div>
//                   </div>

//                   {/* NFC */}
//                   <div className="flex items-center gap-2 bg-surface rounded-xl px-3 py-2 mb-3">
//                     <span className="text-base">💳</span>
//                     <span className="font-mono text-[11.5px] text-gray-500 font-semibold">
//                       {p.nfcCardNumber || "No NFC card"}
//                     </span>
//                   </div>

//                   {/* Location */}
//                   {p.location?.coordinates?.[0] &&
//                     p.location?.coordinates?.[1] && (
//                       <a
//                         href={`https://www.google.com/maps?q=${p.location.coordinates[1]},${p.location.coordinates[0]}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="flex items-center gap-2 bg-surface rounded-xl px-3 py-2 mb-3 hover:bg-brand-lighter transition-colors group/loc"
//                       >
//                         <img
//                           src={locationIcon}
//                           alt="location"
//                           className="w-3 h-3 opacity-70 flex-shrink-0"
//                         />
//                         <div className="flex gap-2 flex-1">
//                           <span className="font-mono text-[11px] text-gray-500 group-hover/loc:text-brand-primary transition-colors">
//                             {p.location.coordinates[1].toFixed(4)}°N
//                           </span>
//                           <span className="text-[11px] text-gray-300">·</span>
//                           <span className="font-mono text-[11px] text-gray-500 group-hover/loc:text-brand-primary transition-colors">
//                             {p.location.coordinates[0].toFixed(4)}°E
//                           </span>
//                         </div>
//                         <span className="text-[10px] text-gray-300 group-hover/loc:text-brand-primary">
//                           ↗
//                         </span>
//                       </a>
//                     )}

//                   {/* Actions */}
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => openEdit(p)}
//                       className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-brand-lighter text-brand-primary text-[12px] font-semibold hover:bg-brand-soft transition-colors"
//                     >
//                       <img
//                         src={editIcon}
//                         alt="edit"
//                         className="w-3.5 h-3.5 opacity-70"
//                       />{" "}
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => setDeleteTarget(p)}
//                       className="px-3 py-1.5 rounded-lg bg-danger-bg text-danger text-[12px] font-semibold hover:bg-red-100 transition-colors"
//                     >
//                       <img
//                         src={deleteIcon}
//                         alt="delete"
//                         className="w-3.5 h-3.5 opacity-70"
//                       />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Pagination below grid */}
//           <div className="bg-white rounded-2xl border border-brand-primary/[0.08] overflow-hidden">
//             <Pagination
//               total={filtered.length}
//               page={page}
//               pageSize={pageSize}
//               onPage={setPage}
//               onPageSize={setPageSize}
//             />
//           </div>
//         </div>
//       )}

//       {/* Modals */}
//       <PatientModal
//         open={modalOpen}
//         onClose={closeModal}
//         onAdd={addPatient}
//         onEdit={(form) => editPatient(editTarget!._id, form)}
//         initialData={editTarget}
//         loading={actionLoading}
//       />
//       <PatientDeleteModal
//         open={!!deleteTarget}
//         patient={deleteTarget}
//         onClose={() => setDeleteTarget(null)}
//         onConfirm={handleDelete}
//         loading={actionLoading}
//       />
//     </div>
//   );
// }

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePatients } from "../hooks/usePatients";
import {
  filterPatients,
  getPatientSummary,
  calcAge,
} from "../helpers/patientHelper";
import { Patient, PatientFilter } from "../types/patient.types";
import { SectionLoader } from "../../../components/Loader/Loader";
import PatientFilters from "../components/patientFilters";
import PatientModal from "../components/patientModal";
import PatientDeleteModal from "../components/patientDeleteModal";
import editIcon from "../../../assets/images/edit.png";
import deleteIcon from "../../../assets/images/delete.png";
import { capitalize } from "../../../utils/helpers";
import userIcon from "../../../assets/images/user.png";
import locationIcon from "../../../assets/images/location.png";
const DEFAULT_FILTERS: PatientFilter = {
  search: "",
  gender: "",
  bloodGroup: "",
  status: "all",
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
type ViewMode = "table" | "grid";

const genderIcon = (g: string) =>
  g === "male" ? "👨" : g === "female" ? "👩" : "🧑";

/* ── Pagination ─────────────────────────────────────────────────────── */
function Pagination({
  total,
  page,
  pageSize,
  onPage,
  onPageSize,
}: {
  total: number;
  page: number;
  pageSize: number;
  onPage: (p: number) => void;
  onPageSize: (s: number) => void;
}) {
  const totalPages = Math.ceil(total / pageSize);
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const getPages = (): (number | "...")[] => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, "...", totalPages];
    if (page >= totalPages - 3)
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  return (
    <div className="flex items-center justify-between px-4 py-3.5 bg-white border-t border-brand-primary/[0.07]">
      <div className="flex items-center gap-3">
        <p className="text-[12.5px] text-gray-400 font-medium">
          Showing{" "}
          <span className="text-navy font-bold">
            {from}–{to}
          </span>{" "}
          of <span className="text-navy font-bold">{total}</span> patients
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] text-gray-400">Per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSize(Number(e.target.value));
              onPage(1);
            }}
            className="h-7 border border-black/10 rounded-lg px-2 text-[12px] font-semibold text-navy outline-none focus:border-brand-primary bg-surface"
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] text-gray-400 hover:bg-surface hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          ‹
        </button>

        {getPages().map((p, i) =>
          p === "..." ? (
            <span
              key={`e-${i}`}
              className="w-8 h-8 flex items-center justify-center text-[12px] text-gray-300"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              className={`w-8 h-8 rounded-lg text-[12.5px] font-semibold transition-all
                ${page === p ? "bg-brand-primary text-white shadow-sm" : "text-gray-500 hover:bg-surface hover:text-navy"}`}
            >
              {p}
            </button>
          ),
        )}

        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] text-gray-400 hover:bg-surface hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          ›
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════════════ */
export default function PatientPage() {
  const navigate = useNavigate();
  const {
    patients,
    loading,
    actionLoading,
    addPatient,
    editPatient,
    removePatient,
  } = usePatients();

  const [filters, setFilters] = useState<PatientFilter>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Patient | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(
    () => filterPatients(patients, filters),
    [patients, filters],
  );
  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );
  const summary = useMemo(() => getPatientSummary(patients), [patients]);

  const merge = (p: Partial<PatientFilter>) => {
    setFilters((f) => ({ ...f, ...p }));
    setPage(1);
  };

  const openAdd = () => {
    setEditTarget(null);
    setModalOpen(true);
  };
  const openEdit = (p: Patient) => {
    setEditTarget(p);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const ok = await removePatient(deleteTarget);
    if (ok) setDeleteTarget(null);
  };

  const summaryCards = [
    {
      label: "Total Patients",
      value: summary.total,
      icon: "👥",
      color: "from-brand-primary/10 to-brand-primary/5",
      text: "text-brand-primary",
      border: "border-brand-primary/15",
    },
    {
      label: "Male",
      value: summary.male,
      icon: "👨",
      color: "from-blue-50 to-blue-50/50",
      text: "text-blue-600",
      border: "border-blue-200",
    },
    {
      label: "Female",
      value: summary.female,
      icon: "👩",
      color: "from-pink-50 to-pink-50/50",
      text: "text-pink-500",
      border: "border-pink-200",
    },
    {
      label: "Active Patients",
      value: summary.active,
      icon: "🟢",
      color: "from-success/10 to-success/5",
      text: "text-green-600",
      border: "border-success/20",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-poppins font-bold text-2xl text-navy tracking-tight">
            Patients
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Manage patient records and medical profiles
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex bg-white border border-brand-primary/[0.08] rounded-xl p-0.5 gap-0.5">
            {(["table", "grid"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all
                  ${viewMode === v ? "bg-surface text-brand-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
              >
                {v === "table" ? "☰" : "⊞"}
              </button>
            ))}
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-gradient text-white text-[13.5px] font-semibold shadow-btn hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
          >
            <span className="text-lg leading-none">+</span> Add Patient
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
      <PatientFilters
        filters={filters}
        onChange={merge}
        onReset={() => {
          setFilters(DEFAULT_FILTERS);
          setPage(1);
        }}
        totalShown={filtered.length}
        total={patients.length}
      />

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-brand-primary/[0.08]">
          <SectionLoader text="Fetching patient records…" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-brand-primary/[0.08] flex flex-col items-center justify-center py-20 gap-3">
          <span className="text-5xl">👥</span>
          <p className="font-poppins font-bold text-navy text-[15px]">
            No patients found
          </p>
          <p className="text-sm text-gray-400">
            Try adjusting filters or register a new patient
          </p>
          <button
            onClick={openAdd}
            className="mt-2 px-5 py-2 rounded-xl bg-brand-lighter text-brand-primary text-[13px] font-semibold hover:bg-brand-soft transition-colors"
          >
            + Register Patient
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* ── Table ── */
        <div className="bg-white rounded-2xl border border-brand-primary/[0.08] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface border-b border-brand-primary/[0.07]">
                {[
                  "Patient",
                  "Phone",
                  "Age / Gender",
                  "Blood",
                  "NFC Card",
                  "Location",
                  "Joined",
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
              {paginated.map((p, i) => (
                <tr
                  key={p._id}
                  style={{ animationDelay: `${i * 35}ms` }}
                  className="border-b border-brand-primary/[0.05] last:border-0 hover:bg-surface/60 transition-colors group animate-[fadeUp_0.3s_ease_both]"
                >
                  {/* Patient */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-brand-lighter flex items-center justify-center">
                        {p.avatar ? (
                          <img
                            src={p.avatar}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={userIcon}
                            alt={p.name}
                            className="w-5 h-5 object-contain opacity-40"
                          />
                          // <span className="text-base">
                          //   {genderIcon(p.gender)}
                          // </span>
                        )}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-navy leading-none">
                          {p.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className="text-[11px] text-gray-400 truncate max-w-[120px]">
                            {p.email}
                          </p>
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${p.isActive !== false ? "bg-success shadow-[0_0_5px_rgba(22,163,74,0.5)]" : "bg-gray-300"}`}
                            title={p.isActive !== false ? "Active" : "Inactive"}
                          />
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="px-4 py-3.5 text-[12.5px] text-gray-600 font-medium">
                    {p.phone}
                  </td>

                  {/* Age / Gender */}
                  <td className="px-4 py-3.5">
                    <p className="text-[12.5px] text-gray-600 font-semibold">
                      {calcAge(p.dob)} yrs
                    </p>
                    <p className="text-[11px] text-gray-400 capitalize">
                      {p.gender}
                    </p>
                  </td>

                  {/* Blood */}
                  <td className="px-4 py-3.5">
                    {p.bloodGroup ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-danger-bg text-danger text-[12px] font-bold">
                        🩸 {p.bloodGroup}
                      </span>
                    ) : (
                      <span className="text-[12px] text-gray-300">—</span>
                    )}
                  </td>

                  {/* NFC */}
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-[11.5px] text-gray-500 bg-surface px-2 py-1 rounded-lg">
                      {p.nfcCardNumber || "—"}
                    </span>
                  </td>

                  {/* Location */}
                  <td className="px-4 py-3.5">
                    {p.location?.coordinates?.[0] &&
                    p.location?.coordinates?.[1] ? (
                      <a
                        href={`https://www.google.com/maps?q=${p.location.coordinates[1]},${p.location.coordinates[0]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col gap-0.5 group/loc w-fit"
                      >
                        <span className="font-mono text-[11px] text-gray-500 bg-surface px-2 py-0.5 rounded-lg group-hover/loc:bg-brand-lighter group-hover/loc:text-brand-primary transition-colors">
                          {p.location.coordinates[1].toFixed(4)}°N
                        </span>
                        <span className="font-mono text-[11px] text-gray-500 bg-surface px-2 py-0.5 rounded-lg group-hover/loc:bg-brand-lighter group-hover/loc:text-brand-primary transition-colors">
                          {p.location.coordinates[0].toFixed(4)}°E
                        </span>
                      </a>
                    ) : (
                      <span className="text-[12px] text-gray-300">—</span>
                    )}
                  </td>

                  {/* Joined */}
                  <td className="px-4 py-3.5 text-[12px] text-gray-400">
                    {new Date(p.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* View Reports */}
                      <button
                        onClick={() =>
                          navigate(`/app/patients/${p._id}/reports`)
                        }
                        title="View Reports"
                        className="w-8 h-8 rounded-lg hover:bg-blue-50 flex items-center justify-center transition-all group/rep"
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 15 15"
                          fill="none"
                          className="text-gray-400 group-hover/rep:text-blue-500 transition-colors"
                        >
                          <rect
                            x="2"
                            y="1.5"
                            width="11"
                            height="12"
                            rx="1.5"
                            stroke="currentColor"
                            strokeWidth="1.3"
                          />
                          <path
                            d="M4.5 5h6M4.5 7.5h6M4.5 10h4"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => openEdit(p)}
                        className="w-8 h-8 rounded-lg hover:bg-brand-lighter flex items-center justify-center transition-all"
                      >
                        <img
                          src={editIcon}
                          alt="edit"
                          className="w-3.5 h-3.5 opacity-70"
                        />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="w-8 h-8 rounded-lg hover:bg-danger-bg flex items-center justify-center transition-all"
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

          <Pagination
            total={filtered.length}
            page={page}
            pageSize={pageSize}
            onPage={setPage}
            onPageSize={setPageSize}
          />
        </div>
      ) : (
        /* ── Grid ── */
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-3 gap-5">
            {paginated.map((p, i) => (
              <div
                key={p._id}
                style={{ animationDelay: `${i * 55}ms` }}
                className="bg-white rounded-2xl border border-brand-primary/[0.08] overflow-hidden hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200 animate-[fadeUp_0.35s_ease_both] group"
              >
                <div className="h-1.5 bg-gradient-to-r from-brand-primary to-brand-gradient" />

                <div className="p-5">
                  {/* Avatar + name */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-brand-lighter flex items-center justify-center border border-brand-primary/10">
                      {p.avatar ? (
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={userIcon}
                          alt={p.name}
                          className="w-8 h-8 object-contain opacity-40"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-poppins font-bold text-[13.5px] text-navy leading-tight truncate">
                          {capitalize(p.name)}
                        </p>
                        <span
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${p.isActive !== false ? "bg-success" : "bg-gray-300"}`}
                        />
                      </div>
                      <p className="text-[11.5px] text-gray-400 mt-0.5 truncate">
                        {p.email}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {p.phone}
                      </p>
                    </div>
                    {p.bloodGroup && (
                      <span className="flex-shrink-0 text-[11px] font-bold text-danger bg-danger-bg px-2 py-1 rounded-lg">
                        🩸 {p.bloodGroup}
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 border-t border-brand-primary/[0.07] pt-3.5 mb-4 text-center">
                    <div>
                      <p className="font-poppins font-bold text-[13px] text-navy">
                        {calcAge(p.dob)}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Age</p>
                    </div>
                    <div>
                      <p className="font-poppins font-bold text-[13px] text-navy capitalize">
                        {p.gender}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Gender</p>
                    </div>
                    <div>
                      <p className="font-poppins font-bold text-[13px] text-navy">
                        {p.height ? `${p.height}ft` : "—"}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Height</p>
                    </div>
                  </div>

                  {/* NFC */}
                  <div className="flex items-center gap-2 bg-surface rounded-xl px-3 py-2 mb-3">
                    <span className="text-base">💳</span>
                    <span className="font-mono text-[11.5px] text-gray-500 font-semibold">
                      {p.nfcCardNumber || "No NFC card"}
                    </span>
                  </div>

                  {/* Location */}
                  {p.location?.coordinates?.[0] &&
                    p.location?.coordinates?.[1] && (
                      <a
                        href={`https://www.google.com/maps?q=${p.location.coordinates[1]},${p.location.coordinates[0]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-surface rounded-xl px-3 py-2 mb-3 hover:bg-brand-lighter transition-colors group/loc"
                      >
                        <img
                          src={locationIcon}
                          alt="location"
                          className="w-3 h-3 opacity-70 flex-shrink-0"
                        />
                        <div className="flex gap-2 flex-1">
                          <span className="font-mono text-[11px] text-gray-500 group-hover/loc:text-brand-primary transition-colors">
                            {p.location.coordinates[1].toFixed(4)}°N
                          </span>
                          <span className="text-[11px] text-gray-300">·</span>
                          <span className="font-mono text-[11px] text-gray-500 group-hover/loc:text-brand-primary transition-colors">
                            {p.location.coordinates[0].toFixed(4)}°E
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-300 group-hover/loc:text-brand-primary">
                          ↗
                        </span>
                      </a>
                    )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/app/patients/${p._id}/reports`)}
                      title="View Reports"
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[12px] font-semibold hover:bg-blue-100 transition-colors"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 15 15"
                        fill="none"
                      >
                        <rect
                          x="2"
                          y="1.5"
                          width="11"
                          height="12"
                          rx="1.5"
                          stroke="currentColor"
                          strokeWidth="1.3"
                        />
                        <path
                          d="M4.5 5h6M4.5 7.5h6M4.5 10h4"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                        />
                      </svg>
                      Reports
                    </button>
                    <button
                      onClick={() => openEdit(p)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-brand-lighter text-brand-primary text-[12px] font-semibold hover:bg-brand-soft transition-colors"
                    >
                      <img
                        src={editIcon}
                        alt="edit"
                        className="w-3.5 h-3.5 opacity-70"
                      />{" "}
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(p)}
                      className="px-3 py-1.5 rounded-lg bg-danger-bg text-danger text-[12px] font-semibold hover:bg-red-100 transition-colors"
                    >
                      <img
                        src={deleteIcon}
                        alt="delete"
                        className="w-3.5 h-3.5 opacity-70"
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination below grid */}
          <div className="bg-white rounded-2xl border border-brand-primary/[0.08] overflow-hidden">
            <Pagination
              total={filtered.length}
              page={page}
              pageSize={pageSize}
              onPage={setPage}
              onPageSize={setPageSize}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      <PatientModal
        open={modalOpen}
        onClose={closeModal}
        onAdd={addPatient}
        onEdit={(form) => editPatient(editTarget!._id, form)}
        initialData={editTarget}
        loading={actionLoading}
      />
      <PatientDeleteModal
        open={!!deleteTarget}
        patient={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={actionLoading}
      />
    </div>
  );
}
