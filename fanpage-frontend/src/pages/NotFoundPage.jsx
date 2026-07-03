import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-lg rounded-3xl bg-white p-10 text-center shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">404</p>
        <h1 className="mt-4 text-4xl font-bold text-slate-900">Trang không tồn tại</h1>
        <p className="mt-4 text-sm leading-7 text-slate-500">
          Đường dẫn bạn truy cập không hợp lệ hoặc trang đã bị di chuyển.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
