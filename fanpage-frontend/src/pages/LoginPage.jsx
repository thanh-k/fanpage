import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import authProvidersService from '../services/authProvidersService';

const LoginPage = () => {
  const { login, isAuthenticated, authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [providers, setProviders] = useState({
    googleConfigured: false,
    smtpConfigured: false,
    googleLoginUrl: null
  });

  const redirectTo = location.state?.from?.pathname || '/';

  if (!authLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }


  useEffect(() => {
    const loadProviders = async () => {
      try {
        const providerConfig = await authProvidersService.getProviders();
        setProviders(providerConfig);
      } catch (providerError) {
        setProviders({
          googleConfigured: false,
          smtpConfigured: false,
          googleLoginUrl: null
        });
      } finally {
        setProvidersLoading(false);
      }
    };

    loadProviders();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(formData);
      navigate(redirectTo, { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.35),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(110,231,183,0.25),_transparent_22%),linear-gradient(180deg,#f8fdff_0%,#f7fbff_45%,#eef8ff_100%)] px-4 py-10">
      <div className="auth-shell grid w-full max-w-5xl overflow-hidden rounded-[36px] border border-white/80 bg-white/85 shadow-soft backdrop-blur-sm lg:grid-cols-2">
        <div className="auth-hero hidden bg-[linear-gradient(135deg,#e0f2fe_0%,#ecfeff_48%,#f0fdf4_100%)] p-10 lg:block">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">
            Discussion Board
          </p>

          <h1 className="mt-6 text-4xl font-bold leading-tight text-slate-900">
            Kết nối, chia sẻ và tương tác trong một không gian diễn đàn đơn giản.
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-600">
            Đây là nơi bạn có thể đăng bài viết, chia sẻ hình ảnh hoặc video,
            tương tác bằng lượt thích và bình luận với giao diện thân thiện,
            gọn gàng và dễ sử dụng.
          </p>

          <p className="mt-4 text-sm leading-7 text-slate-600">
            Hãy tham gia cùng chúng tôi và trải nghiệm những điều thú vị trên
            Discussion Board!
          </p>
        </div>

        <div className="auth-form-panel p-6 sm:p-10">
          <div className="mx-auto max-w-md">
            <div className="inline-flex rounded-full bg-gradient-to-r from-sky-100 to-cyan-100 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-200">
              Chào mừng bạn quay lại
            </div>

            <h2 className="mt-4 text-3xl font-bold text-slate-900">
              Đăng nhập
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Tiếp tục để vào Discussion Board và bắt đầu tương tác.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <Input
                label="Tên đăng nhập"
                name="username"
                placeholder="Nhập username"
                value={formData.username}
                onChange={handleChange}
              />

              <Input
                label="Mật khẩu"
                type="password"
                name="password"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
              />

              {error ? <p className="text-sm text-rose-600">{error}</p> : null}

              <div className="flex items-center justify-between gap-3">
                <Link to="/forgot-password" className="text-sm font-medium text-sky-600 hover:text-sky-700">
                  Quên mật khẩu?
                </Link>
              </div>

              <Button type="submit" className="w-full py-3" disabled={submitting}>
                {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">Hoặc</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {providersLoading ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
                Đang kiểm tra cấu hình đăng nhập Google...
              </div>
            ) : providers.googleConfigured ? (
            <a
              href={providers.googleLoginUrl ? `${import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:8080'}${providers.googleLoginUrl}` : authService.getGoogleLoginUrl()}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-sky-300 hover:text-sky-700"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.4l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12S6.8 21.5 12 21.5c6.9 0 9.1-4.8 9.1-7.2 0-.5-.1-.9-.1-1.3H12Z" />
                  <path fill="#34A853" d="M3.6 7.3l3.2 2.3C7.6 7.6 9.6 6 12 6c1.9 0 3.1.8 3.8 1.4l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5c-3.6 0-6.6 2.1-8.4 4.8Z" />
                  <path fill="#4A90E2" d="M12 21.5c2.5 0 4.7-.8 6.2-2.3l-3-2.4c-.8.6-1.8 1-3.2 1-3.9 0-5.2-2.5-5.5-3.8l-3.1 2.4c1.7 3.3 5.1 5.1 8.6 5.1Z" />
                  <path fill="#FBBC05" d="M6.5 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2L3.4 7.6C2.8 8.8 2.5 10.4 2.5 12s.3 3.2.9 4.4L6.5 14Z" />
                </svg>
                Đăng nhập bằng Google
              </a>
            ) : (
              <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Đăng nhập Google chưa được cấu hình ở backend. Hãy thêm GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET.
              </div>
            )}

            <p className="mt-6 text-sm text-slate-500">
              Chưa có tài khoản?{' '}
              <Link
                to="/register"
                className="font-semibold text-sky-600 hover:text-sky-700"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
