import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import adminService from "../../services/adminService";
import AdminToolbar from "../../components/admin/AdminToolbar";
import AdminPagination, { useAdminPagination } from "../../components/admin/AdminPagination";
import { PERMISSIONS, formatAdminDate } from "../../components/admin/adminUtils";

const AdminBannedWordsPage = () => {
  const [bannedWords, setBannedWords] = useState([]);
  const [newWord, setNewWord] = useState("");
  const [keyword, setKeyword] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadWords = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminService.getBannedWords();
      setBannedWords(Array.isArray(data) ? data.filter((item) => item?.id) : []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách từ cấm.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWords();
  }, []);

  const filteredWords = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return bannedWords;
    return bannedWords.filter((item) =>
      item?.word?.toLowerCase().includes(q)
    );
  }, [bannedWords, keyword]);

  const pagination = useAdminPagination(filteredWords, 10, [keyword]);

  const handleAddWord = async (e) => {
    e.preventDefault();
    if (!newWord.trim()) return;

    setError("");
    setSuccessMsg("");

    try {
      setSubmitting(true);
      await adminService.addBannedWord({ word: newWord.trim() });
      setNewWord("");
      setShowForm(false);
      setSuccessMsg("Đã thêm từ cấm mới.");
      await loadWords();
    } catch (err) {
      setError(err.message || "Lỗi khi thêm từ cấm mới.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWord = async (id, word) => {
    if (!window.confirm(`Bạn muốn gỡ bỏ từ "${word}"?`)) return;

    try {
      await adminService.deleteBannedWord(id);
      setBannedWords((prev) => prev.filter((item) => item.id !== id));
      setSuccessMsg("Đã gỡ bỏ từ cấm.");
    } catch (err) {
      setError(err.message || "Gỡ bỏ từ cấm thất bại.");
    }
  };

  return (
    <AdminLayout requiredPermissions={[PERMISSIONS.POST_MODERATE]}>
      <div className="space-y-5">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-500">
            Automated Protection
          </p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-950">
                Bộ lọc từ cấm
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Quản lý danh sách từ ngữ bị chặn. Khi người dùng đăng bài, hệ
                thống sẽ kiểm tra nội dung và chặn nếu phát hiện từ cấm.
              </p>
            </div>

            <button
              type="button"
              onClick={loadWords}
              className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-200"
            >
              Làm mới
            </button>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex-1">
              <AdminToolbar
                search={keyword}
                onSearch={setKeyword}
                right={
                  <span className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-600">
                    {filteredWords.length} từ đang cấm
                  </span>
                }
              />
            </div>

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-black text-white hover:bg-sky-600"
            >
              + Thêm từ mới
            </button>
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
              {error}
            </p>
          )}

          {successMsg && (
            <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-600">
              {successMsg}
            </p>
          )}
        </div>

        <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-100">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                <th className="p-4">Từ ngữ bị chặn</th>
                <th className="p-4">Ngày thiết lập</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="3" className="p-6 text-center text-sm text-slate-500">
                    Đang tải danh sách...
                  </td>
                </tr>
              ) : filteredWords.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-6 text-center text-sm text-slate-500">
                    Không có từ cấm phù hợp.
                  </td>
                </tr>
              ) : (
                pagination.pagedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-4 text-sm font-bold text-rose-600">
                      {item.word}
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-500">
                      {item.createdAt ? formatAdminDate(item.createdAt) : "Chưa xác định"}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteWord(item.id, item.word)}
                        className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700 hover:bg-rose-50 hover:text-rose-600"
                      >
                        Gỡ chặn
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <AdminPagination pagination={pagination} />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <form
            onSubmit={handleAddWord}
            className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-950">
                  Thêm từ cấm mới
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Hệ thống sẽ kiểm tra không phân biệt chữ hoa, chữ thường.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-black text-slate-600"
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="Ví dụ: dm, vcl, dkm..."
              className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-50"
              autoFocus
            />

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-200"
              >
                Hủy
              </button>

              <button
                type="submit"
                disabled={submitting || !newWord.trim()}
                className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-black text-white hover:bg-sky-600 disabled:opacity-50"
              >
                {submitting ? "Đang thêm..." : "Thêm từ"}
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminBannedWordsPage;