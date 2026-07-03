import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import adminService from '../../services/adminService';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminToolbar from '../../components/admin/AdminToolbar';
import AdminPagination, { useAdminPagination } from '../../components/admin/AdminPagination';
import { PERMISSIONS, formatAdminDate, hasPermission, includesKeyword } from '../../components/admin/adminUtils';
import { useAuth } from '../../context/AuthContext';

const AdminCommentsPage = () => {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const canDelete = hasPermission(currentUser, PERMISSIONS.COMMENT_DELETE);

  const loadComments = async () => {
    setLoading(true);
    setError('');
    try { setComments(await adminService.getComments()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadComments(); }, []);
  const filtered = useMemo(() => includesKeyword(comments, keyword, ['content', 'authorName', 'authorUsername', 'authorEmail', 'postContentPreview']), [comments, keyword]);
  const pagination = useAdminPagination(filtered, 10, [keyword]);

  const remove = async (id) => {
    if (!confirm('Xóa bình luận spam/vi phạm này?')) return;
    await adminService.deleteComment(id);
    await loadComments();
  };

  return (
    <AdminLayout requiredPermissions={[PERMISSIONS.COMMENT_VIEW]}>
      <AdminPageHeader eyebrow="Comments" title="Quản lý bình luận" description="Theo dõi bình luận, tìm spam và xóa nếu role của bạn được cấp quyền COMMENT_DELETE." action={<button onClick={loadComments} className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-black text-white hover:bg-sky-600">Làm mới</button>} />
      <AdminToolbar search={keyword} onSearch={setKeyword} right={<span className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-600">{filtered.length} bình luận</span>} />
      {error ? <div className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-600">{error}</div> : null}

      <div className="grid gap-4">
        {loading ? <div className="rounded-3xl bg-white p-6 text-slate-500">Đang tải...</div> : null}
        {!loading && filtered.length === 0 ? <div className="rounded-3xl bg-white p-6 text-slate-500">Không có bình luận phù hợp.</div> : null}
        {pagination.pagedItems.map((comment) => (
          <div key={comment.id} className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap gap-2 text-xs font-black text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1">#{comment.id}</span>
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">Bài #{comment.postId}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">{formatAdminDate(comment.createdAt)}</span>
                </div>
                <p className="mt-4 text-sm font-black text-slate-900">{comment.authorName} <span className="font-semibold text-slate-500">@{comment.authorUsername}</span></p>
                <p className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-800">{comment.content}</p>
                <p className="mt-3 text-xs font-semibold text-slate-500">Bài viết liên quan: {comment.postContentPreview}</p>
              </div>
              {canDelete ? <button onClick={() => remove(comment.id)} className="rounded-xl bg-rose-50 px-4 py-2 text-xs font-black text-rose-700 hover:bg-rose-100">Xóa spam</button> : null}
            </div>
          </div>
        ))}
      </div>
      <AdminPagination pagination={pagination} />
    </AdminLayout>
  );
};

export default AdminCommentsPage;
