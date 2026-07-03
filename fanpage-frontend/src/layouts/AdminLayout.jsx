import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasAnyPermission, hasPermission, isAdminAccount, PERMISSIONS } from '../components/admin/adminUtils';
import AdminAccessDenied from '../components/admin/AdminAccessDenied';

const adminMenus = [
  { to: '/admin', label: 'Tổng quan', icon: '📊', exact: true, permissions: [PERMISSIONS.DASHBOARD_VIEW] },
  { to: '/admin/users', label: 'Người dùng', icon: '👥', permissions: [PERMISSIONS.USER_VIEW] },
  { to: '/admin/account-deletion-requests', label: 'Yêu cầu hủy TK', icon: '🗑️', permissions: [PERMISSIONS.USER_VIEW] },
  { to: '/admin/staff', label: 'Nhân sự & Role', icon: '🛡️', permissions: [PERMISSIONS.STAFF_VIEW, PERMISSIONS.ROLE_MANAGE] },
  { to: '/admin/posts', label: 'Bài viết', icon: '📝', permissions: [PERMISSIONS.POST_VIEW] },
  { to: '/admin/comments', label: 'Bình luận', icon: '💬', permissions: [PERMISSIONS.COMMENT_VIEW] },
  { to: '/admin/reports', label: 'Tố cáo', icon: '🚩', permissions: [PERMISSIONS.REPORT_VIEW] },
  { to: '/admin/banned-words', label: 'Bộ lọc từ cấm', icon: '🛡️', permissions: [PERMISSIONS.POST_MODERATE] }
];

const getVisibleMenus = (user) => adminMenus.filter((item) => hasAnyPermission(user, item.permissions));

const AdminLayout = ({ children, requiredPermissions = [] }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const visibleMenus = getVisibleMenus(currentUser);
  const canViewPage = requiredPermissions.length === 0 || hasAnyPermission(currentUser, requiredPermissions);

  if (!isAdminAccount(currentUser)) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 sm:p-8">
        <AdminAccessDenied title="Không phải tài khoản quản trị" description="Trang quản trị chỉ dành cho Super Admin hoặc nhân sự đã được cấp role." />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-slate-950 text-white xl:flex xl:flex-col">
        <div className="border-b border-white/10 p-6">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500 text-xl font-black shadow-lg shadow-sky-900/40">A</div>
            <div>
              <p className="text-lg font-black">Admin Center</p>
              <p className="text-xs text-slate-400">Fanpage Management</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {visibleMenus.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${isActive ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-sm font-black">{currentUser?.name || currentUser?.fullName || currentUser?.username}</p>
            <p className="mt-1 text-xs text-slate-400">{currentUser?.role === 'SUPER_ADMIN' ? 'Super Admin toàn quyền' : currentUser?.staffRoleName || 'Nhân sự'}</p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link to="/" className="rounded-2xl bg-white/10 px-3 py-2 text-center text-xs font-bold text-white hover:bg-white/20">Trang user</Link>
            <button onClick={logout} className="rounded-2xl bg-rose-500 px-3 py-2 text-xs font-bold text-white hover:bg-rose-600">Đăng xuất</button>
          </div>
        </div>
      </aside>

      <section className="xl:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-500">Khu vực quản trị</p>
              <h1 className="text-xl font-black text-slate-950">Quản trị tách biệt với trang người dùng</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link to="/" className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">← Trang user</Link>
              <button onClick={logout} className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">Đăng xuất</button>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto px-4 pb-4 xl:hidden sm:px-6 lg:px-8">
            {visibleMenus.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.exact} className={({ isActive }) => `shrink-0 rounded-2xl px-4 py-2 text-sm font-bold ${isActive ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600'}`}>{item.icon} {item.label}</NavLink>
            ))}
          </nav>
        </header>

        <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
          {visibleMenus.length === 0 ? (
            <AdminAccessDenied title="Chưa có quyền quản trị" description="Tài khoản của bạn là nhân sự nhưng chưa được gán quyền nào. Hãy liên hệ Super Admin." />
          ) : !canViewPage ? (
            <AdminAccessDenied description={`Bạn không có quyền vào đường dẫn ${location.pathname}. Menu này đã được ẩn theo quyền hiện tại.`} />
          ) : children}
        </div>
      </section>
    </main>
  );
};

export default AdminLayout;
export { getVisibleMenus };
