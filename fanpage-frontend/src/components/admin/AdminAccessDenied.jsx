import { Link } from 'react-router-dom';

const AdminAccessDenied = ({ title = 'Bạn không có quyền truy cập mục này', description = 'Mục này chỉ hiển thị với tài khoản được Super Admin cấp quyền phù hợp.' }) => (
  <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm ring-1 ring-slate-100">
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-3xl">🔒</div>
    <h2 className="mt-4 text-2xl font-bold text-slate-900">{title}</h2>
    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p>
    <Link to="/" className="mt-6 inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">Quay lại trang người dùng</Link>
  </div>
);
export default AdminAccessDenied;
