import { useState, useMemo } from "react";
import { useCategories } from "../hooks/useCategories";
import {
  Category,
  SubCategory,
  CategoryFormValues,
  SubCategoryFormValues,
} from "../types/category.types";
import { SectionLoader } from "../../../components/Loader/Loader";
import CategoryModal from "../components/categoryModal";
import SubCategoryModal from "../components/subCategoryModal";
import DeleteModal from "../components/deleteModal";
import editIcon from "../../../assets/images/edit.png";
import deleteIcon from "../../../assets/images/delete.png";
import searchIcon from "../../../assets/images/search.png";
import folderIcon from "../../../assets/images/folder.png";
import { toTitleCase } from "../../../features/doctors/helpers/doctorHelper";

type DeleteTarget =
  | { type: "category"; item: Category; categoryId?: string }
  | { type: "subCategory"; item: SubCategory; categoryId: string }
  | null;

export default function CategoryPage() {
  const {
    categories,
    loading,
    actionLoading,
    addCategory,
    editCategory,
    removeCategory,
    toggleCategory,
    addSubCategory,
    editSubCategory,
    removeSubCategory,
    toggleSubCategory,
  } = useCategories();

  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [search, setSearch] = useState("");
  const [subSearch, setSubSearch] = useState("");

  const [catModal, setCatModal] = useState<{
    open: boolean;
    data: Category | null;
  }>({ open: false, data: null });
  const [subModal, setSubModal] = useState<{
    open: boolean;
    data: SubCategory | null;
    parent: Category | null;
  }>({ open: false, data: null, parent: null });
  const [deleteModal, setDeleteModal] = useState<DeleteTarget>(null);

  // Keep selectedCat in sync after edits/toggles
  const syncedSelected = useMemo(
    () =>
      selectedCat
        ? (categories.find((c) => c._id === selectedCat._id) ?? null)
        : null,
    [categories, selectedCat],
  );

  const filteredCats = useMemo(
    () =>
      categories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [categories, search],
  );

  const filteredSubs = useMemo(
    () =>
      (syncedSelected?.subCategories ?? []).filter((s) =>
        s.name.toLowerCase().includes(subSearch.toLowerCase()),
      ),
    [syncedSelected, subSearch],
  );

  const handleCatSubmit = (form: CategoryFormValues) =>
    catModal.data ? editCategory(catModal.data._id, form) : addCategory(form);

  const handleSubSubmit = (form: SubCategoryFormValues) =>
    subModal.data
      ? editSubCategory(subModal.data._id, form)
      : addSubCategory(form);

  const handleDelete = async () => {
    if (!deleteModal) return;
    if (deleteModal.type === "category") {
      const ok = await removeCategory(deleteModal.item as Category);
      if (ok) {
        setDeleteModal(null);
        if (syncedSelected?._id === deleteModal.item._id) setSelectedCat(null);
      }
    } else {
      const ok = await removeSubCategory(
        deleteModal.item as SubCategory,
        deleteModal.categoryId!,
      );
      if (ok) setDeleteModal(null);
    }
  };

  const totalSubs = categories.reduce((s, c) => s + c.subCategories.length, 0);
  const activeCats = categories.filter((c) => c.isActive).length;

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-poppins font-bold text-2xl text-navy tracking-tight">
            Categories
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {categories.length} categories · {totalSubs} sub-categories
          </p>
        </div>
        <button
          onClick={() => setCatModal({ open: true, data: null })}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-gradient text-white text-[13.5px] font-semibold shadow-btn hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
        >
          <span className="text-lg leading-none">+</span> Add Category
        </button>
      </div>

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: "Total",
            value: categories.length,
            sub: "categories",
            icon: folderIcon,
            bg: "bg-brand-lighter",
            text: "text-brand-primary",
            dot: "bg-brand-primary",
          },
          {
            label: "Active",
            value: activeCats,
            sub: "categories",
            icon: "✅",
            bg: "bg-success-bg",
            text: "text-green-700",
            dot: "bg-green-500",
          },
          {
            label: "Total",
            value: totalSubs,
            sub: "sub-categories",
            icon: "📋",
            bg: "bg-blue-50",
            text: "text-blue-600",
            dot: "bg-blue-400",
          },
          {
            label: "Inactive",
            value: categories.length - activeCats,
            sub: "categories",
            icon: "🔴",
            bg: "bg-danger-bg",
            text: "text-danger",
            dot: "bg-danger",
          },
        ].map((s, i) => (
          <div
            key={i}
            className={`${s.bg} rounded-2xl px-4 py-3 flex items-center gap-3`}
          >
            {typeof s.icon === "string" && s.icon.length > 2 ? (
              <img src={s.icon} alt="icon" className="w-6 h-6 object-contain" />
            ) : (
              <span className="text-2xl">{s.icon}</span>
            )}
            <div>
              <p
                className={`font-poppins font-extrabold text-[22px] leading-none ${s.text}`}
              >
                {s.value}
              </p>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                {s.label} {s.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Split panel ── */}
      <div
        className="flex gap-4 flex-1 min-h-0"
        style={{ height: "calc(100vh - 300px)" }}
      >
        {/* ══ LEFT: Category list ══ */}
        <div className="w-[340px] flex-shrink-0 flex flex-col bg-white rounded-2xl border border-brand-primary/[0.08] overflow-hidden">
          {/* List header */}
          <div className="px-4 pt-4 pb-3 border-b border-brand-primary/[0.06]">
            <div className="relative">
              <img
                src={searchIcon}
                alt="search"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-70"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories…"
                className="w-full h-9 pl-9 pr-3 bg-surface rounded-xl text-[12.5px] font-medium text-navy placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-brand-primary/10 border border-transparent focus:border-brand-primary/20 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* List body */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {loading ? (
              <SectionLoader text="Loading…" />
            ) : filteredCats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 py-12">
                <img
                  src={folderIcon}
                  alt="no-cat"
                  className="w-12 h-12 opacity-20"
                />
                <p className="text-[13px] font-semibold text-gray-400">
                  No categories found
                </p>
                <button
                  onClick={() => setCatModal({ open: true, data: null })}
                  className="text-[12px] text-brand-primary font-semibold hover:underline"
                >
                  + Add one
                </button>
              </div>
            ) : (
              <div className="p-2 flex flex-col gap-1">
                {filteredCats.map((cat) => {
                  const isSelected = syncedSelected?._id === cat._id;
                  return (
                    <div
                      key={cat._id}
                      onClick={() => {
                        setSelectedCat(cat);
                        setSubSearch("");
                      }}
                      className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-150
                        ${
                          isSelected
                            ? "bg-gradient-to-r from-brand-primary to-brand-gradient text-white shadow-md"
                            : "hover:bg-surface text-navy"
                        }`}
                    >
                      {/* Category icon */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 transition-colors
                        ${isSelected ? "bg-white/20" : "bg-brand-lighter"}`}
                      >
                        <img
                          src={folderIcon}
                          alt="cat"
                          className={`w-4 h-4 `}
                        />
                      </div>

                      {/* Name + count */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-[13px] font-semibold truncate ${isSelected ? "text-white" : "text-navy"}`}
                        >
                          {toTitleCase(cat.name)}
                        </p>
                        <p
                          className={`text-[11px] mt-0.5 ${isSelected ? "text-white/70" : "text-gray-400"}`}
                        >
                          {cat.subCategories.length} sub-
                          {cat.subCategories.length === 1
                            ? "category"
                            : "categories"}
                        </p>
                      </div>

                      {/* Active dot */}
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${cat.isActive ? "bg-green-400" : "bg-gray-300"}`}
                      />

                      {/* Hover actions — only when not selected */}
                      {!isSelected && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5 bg-white rounded-lg shadow-md border border-brand-primary/10 p-0.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCatModal({ open: true, data: cat });
                            }}
                            className="w-7 h-7 rounded-md hover:bg-brand-lighter flex items-center justify-center transition-all"
                            title="Edit"
                          >
                            <img
                              src={editIcon}
                              alt="edit"
                              className="w-3.5 h-3.5 opacity-70"
                            />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteModal({ type: "category", item: cat });
                            }}
                            className="w-7 h-7 rounded-md hover:bg-danger-bg flex items-center justify-center transition-all"
                            title="Delete"
                          >
                            <img
                              src={deleteIcon}
                              alt="delete"
                              className="w-3.5 h-3.5 opacity-70 hover:opacity-100"
                            />
                          </button>
                        </div>
                      )}

                      {/* Arrow if selected */}
                      {isSelected && (
                        <span className="text-white/80 text-xs flex-shrink-0">
                          ▶
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ══ RIGHT: Sub-category panel ══ */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-brand-primary/[0.08] overflow-hidden min-w-0">
          {syncedSelected ? (
            <>
              {/* Panel header */}
              <div className="px-5 py-4 border-b border-brand-primary/[0.06] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-brand-lighter flex items-center justify-center flex-shrink-0">
                    <img
                      src={folderIcon}
                      alt="cat"
                      className="w-5 h-5 opacity-60"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-poppins font-bold text-[15px] text-navy truncate">
                      {syncedSelected.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full
                        ${syncedSelected.isActive ? "bg-success-bg text-green-700" : "bg-gray-100 text-gray-400"}`}
                      >
                        {syncedSelected.isActive ? "Active" : "Inactive"}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {syncedSelected.subCategories.length} sub-categories
                      </span>
                    </div>
                  </div>
                </div>

                {/* Header actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Search subs */}
                  <div className="relative">
                    <img
                      src={searchIcon}
                      alt="search"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-70"
                    />
                    <input
                      value={subSearch}
                      onChange={(e) => setSubSearch(e.target.value)}
                      placeholder="Search sub-categories…"
                      className="h-9 pl-8 pr-3 bg-surface rounded-xl text-[12px] font-medium text-navy placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-brand-primary/10 border border-transparent focus:border-brand-primary/20 transition-all w-72"
                    />
                  </div>
                  <button
                    onClick={() =>
                      setCatModal({ open: true, data: syncedSelected })
                    }
                    className="h-9 px-3 rounded-xl border border-brand-primary/20 text-brand-primary text-[12px] font-semibold hover:bg-brand-lighter transition-colors flex items-center gap-1.5"
                  >
                    <img src={editIcon} alt="edit" className="w-3.5 h-3.5" />{" "}
                    Edit
                  </button>

                  {/* Add sub */}
                  <button
                    onClick={() =>
                      setSubModal({
                        open: true,
                        data: null,
                        parent: syncedSelected,
                      })
                    }
                    className="h-9 px-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-gradient text-white text-[12.5px] font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5"
                  >
                    + Add Sub
                  </button>
                </div>
              </div>

              {/* Sub-category grid */}
              <div className="flex-1 overflow-y-auto scrollbar-hide p-5">
                {filteredSubs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-brand-lighter flex items-center justify-center text-3xl">
                      📭
                    </div>
                    <p className="font-poppins font-bold text-[14px] text-navy">
                      {subSearch ? "No results found" : "No sub-categories yet"}
                    </p>
                    <p className="text-[12px] text-gray-400">
                      {subSearch
                        ? "Try a different search term"
                        : `Add your first sub-category to "${syncedSelected.name}"`}
                    </p>
                    {!subSearch && (
                      <button
                        onClick={() =>
                          setSubModal({
                            open: true,
                            data: null,
                            parent: syncedSelected,
                          })
                        }
                        className="mt-1 px-4 py-2 rounded-xl bg-brand-lighter text-brand-primary text-[12.5px] font-semibold hover:bg-brand-soft transition-colors"
                      >
                        + Add Sub-Category
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {filteredSubs.map((sub, si) => (
                      <div
                        key={sub._id}
                        style={{ animationDelay: `${si * 40}ms` }}
                        className="group relative bg-surface hover:bg-brand-lighter border border-brand-primary/[0.06] hover:border-brand-primary/20 rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200 animate-[fadeUp_0.25s_ease_both]"
                      >
                        {/* Status dot */}
                        <div className="absolute top-3 right-3">
                          <span
                            className={`w-2 h-2 rounded-full block
                            ${sub.isActive ? "bg-green-400" : "bg-gray-300"}`}
                          />
                        </div>

                        {/* Icon */}
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-brand-primary/10 flex items-center justify-center shadow-sm">
                          {sub.icon ? (
                            <img
                              src={sub.icon}
                              alt={sub.name}
                              className="w-full h-full object-contain p-1.5"
                            />
                          ) : (
                            <span className="text-2xl">📋</span>
                          )}
                        </div>

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-navy leading-tight">
                            {toTitleCase(sub.name)}
                          </p>
                          <p className="text-[10.5px] text-gray-400 font-mono mt-1">
                            #{sub._id.slice(-6)}
                          </p>
                        </div>

                        {/* Status pill */}
                        <button
                          // onClick={() => toggleSubCategory(sub, syncedSelected._id)}
                          className={`self-start flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold transition-colors
                            ${
                              sub.isActive
                                ? "bg-success-bg text-green-700 hover:bg-green-100"
                                : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                            }`}
                        >
                          {sub.isActive ? "Active" : "Inactive"}
                        </button>

                        {/* Hover action bar */}
                        <div
                          className="absolute inset-x-0 bottom-0 rounded-b-2xl bg-white border-t border-brand-primary/10
                          flex items-center justify-center gap-1 py-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <button
                            onClick={() =>
                              setSubModal({
                                open: true,
                                data: sub,
                                parent: syncedSelected,
                              })
                            }
                            className="flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-brand-lighter text-brand-primary text-[11.5px] font-semibold transition-colors"
                          >
                            <img
                              src={editIcon}
                              alt="edit"
                              className="w-3 h-3"
                            />{" "}
                            Edit
                          </button>
                          <div className="w-px h-4 bg-gray-200" />
                          <button
                            onClick={() =>
                              setDeleteModal({
                                type: "subCategory",
                                item: sub,
                                categoryId: syncedSelected._id,
                              })
                            }
                            className="flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-danger-bg text-danger text-[11.5px] font-semibold transition-colors"
                          >
                            <img
                              src={deleteIcon}
                              alt="delete"
                              className="w-3 h-3"
                            />{" "}
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add sub card */}
                    <button
                      onClick={() =>
                        setSubModal({
                          open: true,
                          data: null,
                          parent: syncedSelected,
                        })
                      }
                      className="border-2 border-dashed border-brand-primary/20 hover:border-brand-primary rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-brand-primary hover:bg-brand-lighter transition-all duration-200 min-h-[140px]"
                    >
                      <div className="w-10 h-10 rounded-xl bg-brand-lighter flex items-center justify-center">
                        <span className="text-brand-primary text-xl font-bold">
                          +
                        </span>
                      </div>
                      <p className="text-[12.5px] font-semibold">
                        Add Sub-Category
                      </p>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Empty state — no category selected */
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 rounded-3xl bg-brand-lighter flex items-center justify-center text-4xl">
                👈
              </div>
              <div className="text-center">
                <p className="font-poppins font-bold text-[15px] text-navy">
                  Select a Category
                </p>
                <p className="text-[12.5px] text-gray-400 mt-1">
                  Click any category on the left to view and manage its
                  sub-categories
                </p>
              </div>
              <button
                onClick={() => setCatModal({ open: true, data: null })}
                className="px-4 py-2 rounded-xl bg-brand-lighter text-brand-primary text-[12.5px] font-semibold hover:bg-brand-soft transition-colors"
              >
                + Add Category
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <CategoryModal
        open={catModal.open}
        onClose={() => setCatModal({ open: false, data: null })}
        onSubmit={handleCatSubmit}
        initialData={catModal.data}
        loading={actionLoading}
      />

      <SubCategoryModal
        open={subModal.open}
        onClose={() => setSubModal({ open: false, data: null, parent: null })}
        onSubmit={handleSubSubmit}
        initialData={subModal.data}
        defaultCategory={subModal.parent}
        categories={categories}
        loading={actionLoading}
      />

      <DeleteModal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
        loading={actionLoading}
        title={deleteModal?.type === "category" ? "Category" : "Sub-Category"}
        name={deleteModal?.item.name ?? ""}
      />
    </div>
  );
}
