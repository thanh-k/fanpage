export const PERMISSIONS = {
  DASHBOARD_VIEW: 'DASHBOARD_VIEW',
  USER_VIEW: 'USER_VIEW',
  STAFF_VIEW: 'STAFF_VIEW',
  ROLE_MANAGE: 'ROLE_MANAGE',
  POST_VIEW: 'POST_VIEW',
  POST_MODERATE: 'POST_MODERATE',
  POST_DELETE: 'POST_DELETE',
  COMMENT_VIEW: 'COMMENT_VIEW',
  COMMENT_DELETE: 'COMMENT_DELETE',
  REPORT_VIEW: 'REPORT_VIEW',
  REPORT_RESOLVE: 'REPORT_RESOLVE'
};

export const hasPermission = (user, permission) => {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  return Array.isArray(user.permissions) && user.permissions.includes(permission);
};

export const hasAnyPermission = (user, permissions = []) => {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  return permissions.some((permission) => hasPermission(user, permission));
};

export const isAdminAccount = (user) => user?.role === 'SUPER_ADMIN' || user?.role === 'STAFF';

export const statusClass = (status) => {
  const value = String(status || '').toUpperCase();
  if (['ACTIVE', 'APPROVED', 'RESOLVED'].includes(value)) return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
  if (['PENDING', 'REVIEWING'].includes(value)) return 'bg-amber-50 text-amber-700 ring-amber-100';
  if (['HIDDEN', 'REJECTED'].includes(value)) return 'bg-slate-100 text-slate-700 ring-slate-200';
  if (['DELETED', 'BLOCKED'].includes(value)) return 'bg-rose-50 text-rose-700 ring-rose-100';
  return 'bg-slate-50 text-slate-600 ring-slate-100';
};

export const formatAdminDate = (value) => {
  if (!value) return 'Chưa có';
  try {
    return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
  } catch {
    return value;
  }
};

export const normalizeText = (value) => String(value || '').toLowerCase().trim();
export const includesKeyword = (items = [], keyword = '', fields = []) => {
  const q = normalizeText(keyword);
  if (!q) return items;
  return items.filter((item) => fields.some((field) => normalizeText(item?.[field]).includes(q)));
};
