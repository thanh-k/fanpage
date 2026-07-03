import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../context/AuthContext';
import authProvidersService from '../services/authProvidersService';

const initialForm = {
  name: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  gender: 'PRIVATE'
};

const RegisterPage = () => {
  const { requestRegisterOtp, isAuthenticated, authLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [providers, setProviders] = useState({
    googleConfigured: false,
    smtpConfigured: false,
    googleLoginUrl: null
  });

  if (!authLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const providerConfig = await authProvidersService.getProviders();
        setProviders({
          googleConfigured: !!providerConfig.googleConfigured,
          smtpConfigured: !!providerConfig.smtpConfigured,
          googleLoginUrl: providerConfig.googleLoginUrl || null
        });
      } catch (loadError) {
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

    if (!providers.smtpConfigured) {
      setError('Chức năng gửi OTP đăng ký chưa sẵn sàng.');
      return;
    }

    setSubmitting(true);

    try {
      await requestRegisterOtp(formData);
      navigate(`/verify-email?purpose=register&email=${encodeURIComponent(formData.email.trim())}`, {
        replace: true
      });
    } catch (submitError) {
      setError(submitError.message || 'Không thể gửi mã xác thực đăng ký.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(186,230,253,0.45),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(167,243,208,0.3),_transparent_26%),linear-gradient(180deg,#fbfeff_0%,#f3fbff_100%)] px-4 py-10">
      <div className="auth-shell auth-register-shell w-full max-w-2xl rounded-[36px] border border-white/80 bg-white/88 p-6 shadow-soft backdrop-blur-sm sm:p-10">
        <div className="inline-flex rounded-full bg-gradient-to-r from-sky-100 to-emerald-100 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-200">
          Tạo tài khoản mới
        </div>

        <h1 className="mt-4 text-3xl font-bold text-slate-900">Đăng ký</h1>

        <p className="mt-2 text-sm text-slate-500">
          Sau khi nhập thông tin, hệ thống sẽ gửi mã OTP 6 số để xác thực Gmail thật.
        </p>

        {!providersLoading && !providers.smtpConfigured ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Chức năng gửi OTP đăng ký chưa sẵn sàng. Hãy cấu hình MAIL_USERNAME và MAIL_PASSWORD trong backend trước.
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Họ và tên"
              name="name"
              placeholder="Nhập họ và tên"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <Input
            label="Tên đăng nhập"
            name="username"
            placeholder="Nhập username"
            value={formData.username}
            onChange={handleChange}
          />

          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="Nhập email"
            value={formData.email}
            onChange={handleChange}
          />
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Giới tính
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400"
            >
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="PRIVATE">Không muốn nói</option>
            </select>
          </div>


          <Input
            label="Mật khẩu"
            name="password"
            type="password"
            placeholder="Nhập mật khẩu"
            value={formData.password}
            onChange={handleChange}
          />

          <Input
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            type="password"
            placeholder="Nhập lại mật khẩu"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          {error ? <p className="sm:col-span-2 text-sm text-rose-600">{error}</p> : null}

          <div className="sm:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="submit"
              className="py-3 sm:px-8"
              disabled={submitting || providersLoading || !providers.smtpConfigured}
            >
              {submitting ? 'Đang gửi mã...' : 'Gửi mã xác thực'}
            </Button>

            <p className="text-sm text-slate-500">
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-700">
                Đăng nhập
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;