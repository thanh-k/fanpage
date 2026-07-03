import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import adminService from '../../services/adminService';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { PERMISSIONS, hasPermission } from '../../components/admin/adminUtils';
import { useAuth } from '../../context/AuthContext';

const number = (value) => Number(value || 0);
const percent = (value, total) => total > 0 ? Math.round((value / total) * 100) : 0;

const StatCard = ({ label, value, hint, icon }) => (
  <div className="overflow-hidden rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-black text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-2 text-4xl font-black text-slate-950 dark:text-white">{value}</p>
        <p className="mt-1 text-xs font-bold text-slate-400 dark:text-slate-500">{hint}</p>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-2xl dark:bg-slate-800">{icon}</div>
    </div>
  </div>
);

const BarChart = ({ title, description, data }) => {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
      <div className="mb-5">
        <h2 className="text-xl font-black text-slate-950 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between text-sm font-black">
              <span className="text-slate-700 dark:text-slate-200">{item.icon} {item.label}</span>
              <span className="text-slate-950 dark:text-white">{item.value}</span>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-teal-400" style={{ width: `${Math.max(6, (item.value / max) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const DonutChart = ({ title, description, segments, centerLabel }) => {
  let current = 0;
  const colors = ['#0ea5e9', '#14b8a6', '#f59e0b', '#ef4444'];
  const total = segments.reduce((sum, item) => sum + item.value, 0);
  const gradient = total > 0
    ? segments.map((item, index) => {
      const start = current;
      const end = current + percent(item.value, total);
      current = end;
      return `${colors[index % colors.length]} ${start}% ${end}%`;
    }).join(', ')
    : '#e2e8f0 0% 100%';

  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
      <div className="mb-5">
        <h2 className="text-xl font-black text-slate-950 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <div className="flex flex-col items-center gap-5 sm:flex-row">
        <div className="relative h-44 w-44 shrink-0 rounded-full" style={{ background: `conic-gradient(${gradient})` }}>
          <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-white text-center dark:bg-slate-900">
            <span className="text-3xl font-black text-slate-950 dark:text-white">{total}</span>
            <span className="text-xs font-bold text-slate-400">{centerLabel}</span>
          </div>
        </div>
        <div className="w-full space-y-3">
          {segments.map((item, index) => (
            <div key={item.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black dark:bg-slate-800">
              <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />{item.label}</span>
              <span className="text-slate-950 dark:text-white">{item.value} <span className="text-xs text-slate-400">({percent(item.value, total)}%)</span></span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AdminDashboardPage = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const loadStats = () => adminService.getStats().then(setStats).catch((err) => setError(err.message));
  useEffect(() => { loadStats(); }, []);

  const shortcuts = useMemo(() => [
    hasPermission(currentUser, PERMISSIONS.USER_VIEW) && { to: '/admin/users', label: 'Quản lý người dùng', icon: '👥' },
    hasPermission(currentUser, PERMISSIONS.STAFF_VIEW) && { to: '/admin/staff', label: 'Nhân sự & Role', icon: '🛡️' },
    hasPermission(currentUser, PERMISSIONS.POST_VIEW) && { to: '/admin/posts', label: 'Kiểm duyệt bài viết', icon: '📝' },
    hasPermission(currentUser, PERMISSIONS.COMMENT_VIEW) && { to: '/admin/comments', label: 'Quản lý bình luận', icon: '💬' },
    hasPermission(currentUser, PERMISSIONS.REPORT_VIEW) && { to: '/admin/reports', label: 'Xử lý tố cáo', icon: '🚩' }
  ].filter(Boolean), [currentUser]);

  const userSegments = [
    { label: 'User', value: number(stats?.totalUsers) },
    { label: 'Staff', value: number(stats?.totalStaff) },
    { label: 'Super Admin', value: number(stats?.totalSuperAdmins) }
  ];
  const contentData = [
    { label: 'Bài viết', value: number(stats?.totalPosts), icon: '📝' },
    { label: 'Bình luận', value: number(stats?.totalComments), icon: '💬' },
    { label: 'Lượt thích', value: number(stats?.totalLikes), icon: '❤️' }
  ];
  const moderationData = [
    { label: 'Bài chờ duyệt', value: number(stats?.pendingPosts), icon: '⏳' },
    { label: 'Tố cáo chờ xử lý', value: number(stats?.pendingReports), icon: '🚩' },
    { label: 'Tố cáo đã xử lý', value: number(stats?.resolvedReports), icon: '✅' }
  ];

  return (
    <AdminLayout requiredPermissions={[PERMISSIONS.DASHBOARD_VIEW]}>
      <AdminPageHeader
        eyebrow="Dashboard"
        title="Tổng quan hệ thống"
        description="Dashboard mới hiển thị số liệu chính bằng biểu đồ để admin nhìn nhanh nội dung, người dùng và các việc cần xử lý."
        action={<button onClick={loadStats} className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-sky-600">Làm mới</button>}
      />

      {error ? <div className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-600 ring-1 ring-rose-100 dark:bg-rose-950/40 dark:text-rose-200 dark:ring-rose-900">{error}</div> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tổng tài khoản" value={number(stats?.totalUsers) + number(stats?.totalStaff) + number(stats?.totalSuperAdmins)} hint="User + Staff + Super Admin" icon="👥" />
        <StatCard label="Tổng nội dung" value={number(stats?.totalPosts) + number(stats?.totalComments)} hint="Bài viết + bình luận" icon="🧾" />
        <StatCard label="Tương tác" value={number(stats?.totalLikes)} hint="Tổng lượt thích/reaction" icon="❤️" />
        <StatCard label="Role đang bật" value={number(stats?.totalRoles)} hint="Vai trò nhân sự" icon="🧩" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <DonutChart title="Cơ cấu tài khoản" description="Phân bổ người dùng theo quyền trong hệ thống." segments={userSegments} centerLabel="tài khoản" />
        <BarChart title="Nội dung & tương tác" description="So sánh nhanh bài viết, bình luận và lượt thích." data={contentData} />
      </div>

      <BarChart title="Tình trạng kiểm duyệt" description="Những số liệu cần admin ưu tiên theo dõi mỗi ngày." data={moderationData} />

      <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
        <h2 className="text-xl font-black text-slate-950 dark:text-white">Thao tác nhanh theo quyền của bạn</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map((item) => (
            <Link key={item.to} to={item.to} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 font-bold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800">
              <span className="text-2xl">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
