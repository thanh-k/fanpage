import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import adminService from '../../services/adminService';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminToolbar from '../../components/admin/AdminToolbar';
import StatusBadge from '../../components/admin/StatusBadge';
import AdminPagination, { useAdminPagination } from '../../components/admin/AdminPagination';
import { PERMISSIONS, formatAdminDate, hasPermission, includesKeyword } from '../../components/admin/adminUtils';
import { useAuth } from '../../context/AuthContext';

const filters = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'ACTIVE', label: 'Đang hiển thị' },
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'HIDDEN', label: 'Đang ẩn' }
];

const DeletePostModal = ({ post, reason, setReason, busy, error, onClose, onConfirm }) => {
  if (!post) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-rose-500">Xác nhận xóa</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">Xóa bài viết của user?</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Đây là bước xác nhận thứ 2. Sau khi xóa, user sẽ nhận thông báo realtime kèm ngày giờ bài đăng và lý do admin xóa.</p>
          </div>
          <button onClick={onClose} disabled={busy} className="rounded-2xl bg-slate-100 px-4 py-2 font-black text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">✕</button>
        </div>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-slate-800">
          <p className="font-black text-slate-950 dark:text-white">{post.authorName} (@{post.authorUsername})</p>
          <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">Đăng lúc: {formatAdminDate(post.createdAt)}</p>
          <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-slate-700 dark:text-slate-200">{post.content || 'Không có nội dung'}</p>
        </div>

        <label className="mt-5 block text-sm font-black text-slate-700 dark:text-slate-200">Lý do xóa <span className="text-rose-500">*</span></label>
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={4}
          placeholder="Ví dụ: Bài viết chứa nội dung vi phạm tiêu chuẩn cộng đồng..."
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-rose-950"
        />
        {error ? <p className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-200">{error}</p> : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button onClick={onClose} disabled={busy} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-600 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Hủy</button>
          <button onClick={onConfirm} disabled={busy || reason.trim().length < 5} className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-black text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Đang xóa...' : 'Tôi chắc chắn muốn xóa'}</button>
        </div>
      </div>
    </div>
  );
};

const AdminPostsPage = () => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('ALL');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const canDelete = hasPermission(currentUser, PERMISSIONS.POST_DELETE);

  const loadPosts = async () => {
    setLoading(true);
    setError('');
    try { setPosts(await adminService.getPosts()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadPosts(); }, []);

  const filtered = useMemo(() => {
    const byKeyword = includesKeyword(posts, keyword, ['content', 'authorName', 'authorUsername', 'authorEmail']);
    return status === 'ALL' ? byKeyword : byKeyword.filter((post) => post.status === status);
  }, [posts, keyword, status]);
  const pagination = useAdminPagination(filtered, 10, [keyword, status]);

  const openDelete = (post) => {
    setDeleteTarget(post);
    setDeleteReason('');
    setDeleteError('');
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteReason.trim().length < 5) {
      setDeleteError('Vui lòng nhập lý do xóa rõ ràng, tối thiểu 5 ký tự.');
      return;
    }
    setDeleting(true);
    setDeleteError('');
    try {
      await adminService.deletePost(deleteTarget.id, deleteReason.trim());
      setDeleteTarget(null);
      setDeleteReason('');
      await loadPosts();
    } catch (err) {
      setDeleteError(err.message || 'Không thể xóa bài viết.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout requiredPermissions={[PERMISSIONS.POST_VIEW]}>
      <AdminPageHeader eyebrow="Posts" title="Kiểm duyệt bài viết" description="Trang này chỉ giữ chức năng xóa bài viết. Khi admin xóa, hệ thống yêu cầu xác nhận 2 bước, nhập lý do và gửi thông báo realtime cho user." action={<button onClick={loadPosts} className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-black text-white hover:bg-sky-600">Làm mới</button>} />
      <AdminToolbar search={keyword} onSearch={setKeyword} filter={status} onFilter={setStatus} filters={filters} right={<span className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-600 dark:bg-slate-800 dark:text-slate-200">{filtered.length} bài viết</span>} />
      {error ? <div className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-200">{error}</div> : null}

      <div className="space-y-4">
        {loading ? <div className="rounded-3xl bg-white p-6 text-slate-500 dark:bg-slate-900 dark:text-slate-300">Đang tải...</div> : null}
        {!loading && filtered.length === 0 ? <div className="rounded-3xl bg-white p-6 text-slate-500 dark:bg-slate-900 dark:text-slate-300">Không có bài viết phù hợp.</div> : null}
        {pagination.pagedItems.map((post) => (
          <article key={post.id} className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge value={post.status} />
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">#{post.id}</span>
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700 dark:bg-sky-950 dark:text-sky-200">{post.anonymous ? 'Ẩn danh' : 'Hiện tên'}</span>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-800 dark:text-slate-100">{post.content || 'Không có nội dung'}</p>
                <div className="mt-4 grid gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 sm:grid-cols-2 lg:grid-cols-4">
                  <span>Người đăng: {post.authorName} (@{post.authorUsername})</span>
                  <span>Email: {post.authorEmail}</span>
                  <span>{post.likesCount ?? 0} like · {post.commentCount ?? 0} bình luận</span>
                  <span>{formatAdminDate(post.createdAt)}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                {canDelete ? <button onClick={() => openDelete(post)} className="rounded-xl bg-rose-50 px-4 py-2 text-xs font-black text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950">Xóa</button> : null}
              </div>
            </div>
          </article>
        ))}
      </div>
      <AdminPagination pagination={pagination} />
      <DeletePostModal post={deleteTarget} reason={deleteReason} setReason={setDeleteReason} busy={deleting} error={deleteError} onClose={() => !deleting && setDeleteTarget(null)} onConfirm={confirmDelete} />
    </AdminLayout>
  );
};

export default AdminPostsPage;
