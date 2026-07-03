import Avatar from '../../components/common/Avatar';
import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import adminService from '../../services/adminService';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminToolbar from '../../components/admin/AdminToolbar';
import AdminPagination, { useAdminPagination } from '../../components/admin/AdminPagination';
import { PERMISSIONS, formatAdminDate, includesKeyword } from '../../components/admin/adminUtils';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [lockModalUser, setLockModalUser] = useState(null);
  const [lockForm, setLockForm] = useState({ duration: 'THIRTY_MINUTES', reason: '' });
  const [processingId, setProcessingId] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try { setUsers(await adminService.getUsers()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(); }, []);

  const openLockModal = (user) => {
    setLockModalUser(user);
    setLockForm({ duration: 'THIRTY_MINUTES', reason: '' });
  };

  const handleLockUser = async (event) => {
    event.preventDefault();
    if (!lockModalUser) return;
    try {
      setProcessingId(lockModalUser.id);
      await adminService.lockUser(lockModalUser.id, lockForm);
      setLockModalUser(null);
      await loadUsers();
    } catch (err) {
      alert(err.message || 'Khóa tài khoản thất bại');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUnlockUser = async (user) => {
    if (!confirm(`Mở khóa tài khoản @${user.username}?`)) return;
    try {
      setProcessingId(user.id);
      await adminService.unlockUser(user.id);
      await loadUsers();
    } catch (err) {
      alert(err.message || 'Mở khóa thất bại');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = useMemo(() => includesKeyword(users, keyword, ['name', 'username', 'email']), [users, keyword]);
  const pagination = useAdminPagination(filtered, 10, [keyword]);

  return (
    <AdminLayout requiredPermissions={[PERMISSIONS.USER_VIEW]}>
      <AdminPageHeader eyebrow="Users" title="Quản lý người dùng" description="Trang này chỉ hiển thị tài khoản USER thông thường, tách riêng khỏi nhân sự để dễ kiểm soát." action={<button onClick={loadUsers} className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-black text-white hover:bg-sky-600">Làm mới</button>} />
      <AdminToolbar search={keyword} onSearch={setKeyword} right={<span className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-600">{filtered.length} người dùng</span>} />
      {error ? <div className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-600">{error}</div> : null}

      <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-100">
        <div className="hidden grid-cols-[1.5fr_1.1fr_1fr_1fr_1fr] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-500 lg:grid">
          <span>Người dùng</span><span>Email</span><span>Trạng thái</span><span>Ngày tham gia</span><span className="text-right">Thao tác</span>
        </div>
        <div className="divide-y divide-slate-100">
          {loading ? <p className="p-6 text-sm text-slate-500">Đang tải...</p> : null}
          {!loading && filtered.length === 0 ? <p className="p-6 text-sm text-slate-500">Không có người dùng phù hợp.</p> : null}
          {pagination.pagedItems.map((user) => (
            <div key={user.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1.5fr_1.1fr_1fr_1fr_1fr] lg:items-center">
              <div className="flex items-center gap-3">
                <Avatar src={user.avatar} name={user.name || user.username} provider={user.provider} size="lg" rounded="xl" />
                <div>
                  <p className="font-black text-slate-900">{user.name || 'Chưa đặt tên'}</p>
                  <p className="text-sm font-semibold text-slate-500">@{user.username}</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-600">{user.email}</p>
              <div className="space-y-1 text-sm font-bold">
                <p className="text-slate-500">{user.provider || 'LOCAL'} · {user.emailVerified ? 'Đã xác thực' : 'Chưa xác thực'}</p>
                {user.locked ? (
                  <p className="rounded-full bg-rose-50 px-3 py-1 text-xs text-rose-700 ring-1 ring-rose-100">Khóa đến {formatAdminDate(user.lockedUntil)}</p>
                ) : (
                  <p className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700 ring-1 ring-emerald-100">Hoạt động</p>
                )}
              </div>
              <p className="text-sm font-semibold text-slate-500">{formatAdminDate(user.joinedAt)}</p>
              <div className="flex flex-wrap justify-end gap-2">
                {user.locked ? (
                  <button type="button" disabled={processingId === user.id} onClick={() => handleUnlockUser(user)} className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 hover:bg-emerald-100 disabled:opacity-50">Mở khóa</button>
                ) : (
                  <button type="button" disabled={processingId === user.id} onClick={() => openLockModal(user)} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 hover:bg-rose-100 disabled:opacity-50">Khóa</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <AdminPagination pagination={pagination} />

      {lockModalUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4" onClick={() => setLockModalUser(null)}>
          <form onSubmit={handleLockUser} className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-950">Khóa tài khoản</h2>
                <p className="mt-1 text-sm text-slate-500">@{lockModalUser.username} · {lockModalUser.email}</p>
              </div>
              <button type="button" onClick={() => setLockModalUser(null)} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-black text-slate-600">×</button>
            </div>
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-bold text-slate-700">Thời gian khóa</label>
              <select value={lockForm.duration} onChange={(e) => setLockForm((prev) => ({ ...prev, duration: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-50">
                <option value="THIRTY_MINUTES">30 phút</option>
                <option value="FOURTEEN_DAYS">14 ngày</option>
                <option value="ONE_MONTH">1 tháng</option>
              </select>
              <textarea value={lockForm.reason} onChange={(e) => setLockForm((prev) => ({ ...prev, reason: e.target.value }))} rows={3} placeholder="Lý do khóa tài khoản..." className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-50" />
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setLockModalUser(null)} className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-700">Hủy</button>
              <button type="submit" disabled={processingId === lockModalUser.id} className="rounded-2xl bg-rose-500 px-5 py-3 text-sm font-black text-white hover:bg-rose-600 disabled:opacity-50">Khóa tài khoản</button>
            </div>
          </form>
        </div>
      ) : null}
    </AdminLayout>
  );
};

export default AdminUsersPage;
