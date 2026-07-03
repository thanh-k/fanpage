import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import adminService from '../../services/adminService';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminToolbar from '../../components/admin/AdminToolbar';
import AdminPagination, { useAdminPagination } from '../../components/admin/AdminPagination';
import Avatar from '../../components/common/Avatar';
import { PERMISSIONS, formatAdminDate, includesKeyword, statusClass } from '../../components/admin/adminUtils';

const statusLabel = (status) => {
  const value = String(status || '').toUpperCase();
  if (value === 'PENDING') return 'Đang chờ duyệt';
  if (value === 'APPROVED') return 'Đã duyệt';
  if (value === 'REJECTED') return 'Đã từ chối';
  return status || 'Không rõ';
};

const AdminAccountDeletionRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('ALL');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      setRequests(await adminService.getAccountDeletionRequests(status));
    } catch (err) {
      setError(err.message || 'Không thể tải yêu cầu hủy tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRequests(); }, [status]);

  const filtered = useMemo(() => includesKeyword(requests, keyword, ['userName', 'username', 'email', 'reason', 'status']), [requests, keyword]);
  const pagination = useAdminPagination(filtered, 10, [keyword, status]);

  const approve = async (item) => {
    if (!confirm(`Duyệt yêu cầu và xóa vĩnh viễn tài khoản @${item.username || item.userName}?`)) return;
    try {
      setProcessingId(item.id);
      await adminService.approveAccountDeletionRequest(item.id);
      await loadRequests();
    } catch (err) {
      alert(err.message || 'Duyệt yêu cầu thất bại.');
    } finally {
      setProcessingId(null);
    }
  };

  const reject = async (item) => {
    const note = prompt('Nhập lý do từ chối (có thể bỏ trống):', 'Chưa đủ điều kiện hủy tài khoản.');
    if (note === null) return;
    try {
      setProcessingId(item.id);
      await adminService.rejectAccountDeletionRequest(item.id, note);
      await loadRequests();
    } catch (err) {
      alert(err.message || 'Từ chối yêu cầu thất bại.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AdminLayout requiredPermissions={[PERMISSIONS.USER_VIEW]}>
      <AdminPageHeader
        eyebrow="Account Deletion"
        title="Yêu cầu hủy tài khoản"
        description="Quản lý các yêu cầu hủy tài khoản do người dùng gửi từ trang hồ sơ. Super Admin có thể duyệt để xóa vĩnh viễn hoặc từ chối yêu cầu."
        action={<button onClick={loadRequests} className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-black text-white hover:bg-sky-600">Làm mới</button>}
      />

      <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
        <AdminToolbar search={keyword} onSearch={setKeyword} right={<span className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-600">{filtered.length} yêu cầu</span>} />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-sky-50">
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PENDING">Đang chờ duyệt</option>
          <option value="APPROVED">Đã duyệt</option>
          <option value="REJECTED">Đã từ chối</option>
        </select>
      </div>

      {error ? <div className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-600">{error}</div> : null}

      <div className="space-y-4">
        {loading ? <div className="rounded-[2rem] bg-white p-6 text-sm font-bold text-slate-500 shadow-sm ring-1 ring-slate-100">Đang tải...</div> : null}
        {!loading && filtered.length === 0 ? <div className="rounded-[2rem] bg-white p-6 text-sm font-bold text-slate-500 shadow-sm ring-1 ring-slate-100">Không có yêu cầu phù hợp.</div> : null}
        {pagination.pagedItems.map((item) => (
          <div key={item.id} className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar src={item.avatar} name={item.userName || item.username} size="lg" rounded="xl" className="h-14 w-14" />
                <div className="min-w-0">
                  <p className="font-black text-slate-950">{item.userName || 'Người dùng'}</p>
                  <p className="truncate text-sm font-semibold text-slate-500">@{item.username || 'unknown'} · {item.email || 'Không có email'}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(item.status)}`}>{statusLabel(item.status)}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Gửi lúc {formatAdminDate(item.createdAt)}</span>
              </div>
            </div>

            {item.reason ? <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">Lý do: {item.reason}</p> : null}
            {item.adminNote ? <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">Ghi chú Admin: {item.adminNote}</p> : null}

            {String(item.status).toUpperCase() === 'PENDING' ? (
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <button disabled={processingId === item.id} onClick={() => reject(item)} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-200 disabled:opacity-50">Từ chối</button>
                <button disabled={processingId === item.id} onClick={() => approve(item)} className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-black text-white hover:bg-rose-600 disabled:opacity-50">Duyệt & xóa vĩnh viễn</button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <AdminPagination pagination={pagination} />
    </AdminLayout>
  );
};

export default AdminAccountDeletionRequestsPage;
