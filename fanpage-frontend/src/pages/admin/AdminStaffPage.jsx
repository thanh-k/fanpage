import Avatar from '../../components/common/Avatar';
import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import adminService from '../../services/adminService';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminToolbar from '../../components/admin/AdminToolbar';
import AdminPagination, { useAdminPagination } from '../../components/admin/AdminPagination';
import { PERMISSIONS, hasPermission, includesKeyword } from '../../components/admin/adminUtils';
import { useAuth } from '../../context/AuthContext';

const emptyForm = { name: '', description: '', active: true, permissions: [] };

const permissionGroup = (code) => {
  if (code.includes('USER')) return 'Người dùng';
  if (code.includes('STAFF') || code.includes('ROLE')) return 'Nhân sự & Role';
  if (code.includes('POST')) return 'Bài viết';
  if (code.includes('COMMENT')) return 'Bình luận';
  if (code.includes('REPORT')) return 'Tố cáo';
  return 'Tổng quan';
};

const AdminStaffPage = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('staff');
  const [staff, setStaff] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [assignTarget, setAssignTarget] = useState('');
  const [assignRole, setAssignRole] = useState('');

  const canViewStaff = hasPermission(currentUser, PERMISSIONS.STAFF_VIEW);
  const canManageRole = hasPermission(currentUser, PERMISSIONS.ROLE_MANAGE);

  const loadData = async () => {
    setError('');
    try {
      const tasks = [];
      tasks.push(canViewStaff || canManageRole ? adminService.getStaff().then(setStaff) : Promise.resolve());
      tasks.push(canManageRole ? adminService.getUsers().then(setUsers) : Promise.resolve());
      tasks.push(canManageRole ? adminService.getRoles().then(setRoles) : Promise.resolve());
      tasks.push(canManageRole ? adminService.getPermissions().then(setPermissions) : Promise.resolve());
      await Promise.all(tasks);
    } catch (err) { setError(err.message); }
  };

  useEffect(() => { loadData(); }, []);

  const filteredStaff = useMemo(() => includesKeyword(staff, keyword, ['name', 'username', 'email', 'staffRoleName', 'role']), [staff, keyword]);
  const staffPagination = useAdminPagination(filteredStaff, 10, [keyword, activeTab]);
  const rolePagination = useAdminPagination(roles, 10, [activeTab]);
  const groupedPermissions = useMemo(() => permissions.reduce((acc, item) => {
    const group = permissionGroup(item.code);
    acc[group] = acc[group] || [];
    acc[group].push(item);
    return acc;
  }, {}), [permissions]);

  const togglePermission = (code) => setForm((prev) => ({
    ...prev,
    permissions: prev.permissions.includes(code) ? prev.permissions.filter((item) => item !== code) : [...prev.permissions, code]
  }));

  const resetForm = () => { setForm(emptyForm); setEditingRoleId(null); };

  const submitRole = async (event) => {
    event.preventDefault();
    const payload = { ...form, permissions: form.permissions };
    if (editingRoleId) await adminService.updateRole(editingRoleId, payload);
    else await adminService.createRole(payload);
    resetForm();
    await loadData();
  };

  const editRole = (role) => {
    setEditingRoleId(role.id);
    setForm({ name: role.name || '', description: role.description || '', active: role.active !== false, permissions: role.permissions || [] });
    setActiveTab('roles');
  };

  const deleteRole = async (roleId) => {
    if (!confirm('Xóa role này? Chỉ xóa được khi role chưa gán cho nhân sự.')) return;
    await adminService.deleteRole(roleId);
    await loadData();
  };

  const assign = async () => {
    if (!assignTarget) return alert('Chọn user cần gán làm nhân sự');
    await adminService.assignStaffRole(Number(assignTarget), assignRole ? Number(assignRole) : null);
    setAssignTarget('');
    setAssignRole('');
    await loadData();
  };

  const removeStaff = async (userId, username) => {
    const ok = confirm(`Xóa quyền nhân sự của ${username || 'user này'}? Tài khoản sẽ quay về người dùng thường.`);
    if (!ok) return;

    try {
      await adminService.removeStaff(userId);
      await loadData();
    } catch (err) {
      alert(err.message || 'Xóa nhân sự thất bại');
    }
  };

  return (
    <AdminLayout requiredPermissions={[PERMISSIONS.STAFF_VIEW, PERMISSIONS.ROLE_MANAGE]}>
      <AdminPageHeader eyebrow="Staff & Roles" title="Quản lý nhân sự và phân quyền động" description="Super Admin tạo role, chọn quyền cụ thể cho role rồi gán role đó cho user để trở thành nhân sự. Người không có quyền sẽ không thấy menu tương ứng." action={<button onClick={loadData} className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-black text-white hover:bg-sky-600">Làm mới</button>} />
      {error ? <div className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-600">{error}</div> : null}

      <div className="flex flex-wrap gap-2 rounded-[1.5rem] bg-white p-2 shadow-sm ring-1 ring-slate-100">
        {canViewStaff ? <button onClick={() => setActiveTab('staff')} className={`rounded-2xl px-5 py-3 text-sm font-black ${activeTab === 'staff' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Nhân sự</button> : null}
        {canManageRole ? <button onClick={() => setActiveTab('roles')} className={`rounded-2xl px-5 py-3 text-sm font-black ${activeTab === 'roles' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Role & quyền</button> : null}
        {canManageRole ? <button onClick={() => setActiveTab('assign')} className={`rounded-2xl px-5 py-3 text-sm font-black ${activeTab === 'assign' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Gán role</button> : null}
      </div>

      {activeTab === 'staff' && canViewStaff ? (
        <>
          <AdminToolbar search={keyword} onSearch={setKeyword} right={<span className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-600">{filteredStaff.length} nhân sự</span>} />
          <div className="grid gap-4">
            {staffPagination.pagedItems.map((user) => (
              <div key={user.id} className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-100">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar src={user.avatar} name={user.name || user.username} provider={user.provider} size="lg" rounded="xl" className="h-14 w-14" />
                    <div>
                      <p className="font-black text-slate-950">{user.name || user.username}</p>
                      <p className="text-sm font-semibold text-slate-500">@{user.username} · {user.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-600">
                    <span className="rounded-full bg-slate-100 px-3 py-1">{user.role}</span>
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">{user.staffRoleName || 'Toàn quyền / Chưa gán role'}</span>
                    {canManageRole && user.role !== 'SUPER_ADMIN' ? (
                      <button
                        type="button"
                        onClick={() => removeStaff(user.id, user.username)}
                        className="rounded-full bg-rose-50 px-4 py-2 text-xs font-black text-rose-700 transition hover:bg-rose-100"
                      >
                        Xóa nhân sự
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(user.permissions || []).map((permission) => <span key={permission} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{permission}</span>)}
                </div>
              </div>
            ))}
          </div>
          <AdminPagination pagination={staffPagination} />
        </>
      ) : null}

      {activeTab === 'roles' && canManageRole ? (
        <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
          <form onSubmit={submitRole} className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h2 className="text-xl font-black text-slate-950">{editingRoleId ? 'Cập nhật role' : 'Tạo role mới'}</h2>
            <div className="mt-4 space-y-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tên role, ví dụ: Quản lý bình luận" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-50" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả nhiệm vụ của role" className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-50" />
              <label className="flex items-center gap-2 text-sm font-bold text-slate-600"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Role đang hoạt động</label>
            </div>
            <div className="mt-5 space-y-4">
              {Object.entries(groupedPermissions).map(([group, items]) => (
                <div key={group}>
                  <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-400">{group}</p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((permission) => (
                      <button type="button" key={permission.code} onClick={() => togglePermission(permission.code)} className={`rounded-full px-3 py-2 text-xs font-black ring-1 ${form.permissions.includes(permission.code) ? 'bg-sky-500 text-white ring-sky-500' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'}`}>{permission.label || permission.code}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-2">
              <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800">{editingRoleId ? 'Lưu role' : 'Tạo role'}</button>
              {editingRoleId ? <button type="button" onClick={resetForm} className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-600">Hủy</button> : null}
            </div>
          </form>
          <div className="space-y-3">
            {rolePagination.pagedItems.map((role) => (
              <div key={role.id} className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-slate-100">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="font-black text-slate-950">{role.name}</p><p className="mt-1 text-sm text-slate-500">{role.description || 'Không có mô tả'} · {role.staffCount || 0} nhân sự</p></div>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${role.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{role.active ? 'Đang bật' : 'Đang tắt'}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">{(role.permissions || []).map((p) => <span key={p} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{p}</span>)}</div>
                <div className="mt-4 flex gap-2"><button onClick={() => editRole(role)} className="rounded-xl bg-sky-50 px-4 py-2 text-xs font-black text-sky-700">Sửa</button><button onClick={() => deleteRole(role.id)} className="rounded-xl bg-rose-50 px-4 py-2 text-xs font-black text-rose-700">Xóa</button></div>
              </div>
            ))}
          </div>
          <AdminPagination pagination={rolePagination} />
        </div>
      ) : null}

      {activeTab === 'assign' && canManageRole ? (
        <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <h2 className="text-xl font-black text-slate-950">Gán user thành nhân sự</h2>
          <p className="mt-2 text-sm text-slate-500">Chọn user thông thường và role muốn gán. Nếu chọn bỏ role, user sẽ quay về USER.</p>
          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
            <select value={assignTarget} onChange={(e) => setAssignTarget(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-sky-50"><option value="">Chọn user</option>{users.map((u) => <option key={u.id} value={u.id}>{u.name || u.username} (@{u.username})</option>)}</select>
            <select value={assignRole} onChange={(e) => setAssignRole(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-sky-50"><option value="">Bỏ role / chuyển về USER</option>{roles.filter((r) => r.active).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
            <button onClick={assign} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800">Gán role</button>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
};

export default AdminStaffPage;
