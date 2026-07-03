// src/components/admin/AdminPagination.jsx
import { useEffect, useMemo, useState } from "react";

export const useAdminPagination = (items = [], pageSize = 10, resetKeys = []) => {
  const [page, setPage] = useState(0);
  const safeItems = Array.isArray(items) ? items : [];
  const totalItems = safeItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => setPage(0), resetKeys);

  useEffect(() => {
    if (page > totalPages - 1) setPage(Math.max(totalPages - 1, 0));
  }, [page, totalPages]);

  const pagedItems = useMemo(() => {
    const start = page * pageSize;
    return safeItems.slice(start, start + pageSize);
  }, [safeItems, page, pageSize]);

  return {
    page,
    setPage,
    pageSize,
    pagedItems,
    totalItems,
    totalPages,
    startItem: totalItems === 0 ? 0 : page * pageSize + 1,
    endItem: Math.min((page + 1) * pageSize, totalItems),
  };
};

const AdminPagination = ({ pagination }) => {
  if (!pagination || pagination.totalItems <= pagination.pageSize) return null;

  const { page, setPage, totalPages } = pagination;

  return (
    <div className="mt-6 flex items-center justify-center gap-3 text-sm font-semibold text-slate-500">
      <span>
        Trang {page + 1} / {totalPages}
      </span>

      <button
        type="button"
        disabled={page === 0}
        onClick={() => setPage(Math.max(page - 1, 0))}
        className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Trước
      </button>

      {Array.from({ length: totalPages }).map((_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => setPage(index)}
          className={`rounded-xl border px-4 py-3 font-bold shadow-sm transition ${
            page === index
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          {index + 1}
        </button>
      ))}

      <button
        type="button"
        disabled={page >= totalPages - 1}
        onClick={() => setPage(Math.min(page + 1, totalPages - 1))}
        className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Sau
      </button>
    </div>
  );
};

export default AdminPagination;