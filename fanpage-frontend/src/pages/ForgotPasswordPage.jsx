import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../context/AuthContext';
import authProvidersService from '../services/authProvidersService';

const ForgotPasswordPage = () => {
  const { requestPasswordResetOtp, isAuthenticated, authLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!providers.smtpConfigured) {
      setError('Chức năng gửi email đặt lại mật khẩu chưa sẵn sàng.');
      return;
    }

    setSubmitting(true);

    try {
      await requestPasswordResetOtp({ email });
      navigate(`/verify-email?purpose=reset-password&email=${encodeURIComponent(email.trim())}`, {
        replace: true
      });
    } catch (submitError) {
      setError(submitError.message || 'Không thể gửi mã đặt lại mật khẩu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f8fdff_0%,#eef8ff_100%)] px-4 py-10">
      <div className="w-full max-w-lg rounded-[32px] border border-white/80 bg-white/90 p-6 shadow-soft sm:p-10">
        <div className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
          Quên mật khẩu
        </div>

        <h1 className="mt-4 text-3xl font-bold text-slate-900">Lấy lại mật khẩu</h1>

        <p className="mt-2 text-sm text-slate-500">
          Nhập email đã đăng ký để nhận mã OTP 6 số qua Gmail SMTP.
        </p>

        {!providersLoading && !providers.smtpConfigured ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Chức năng gửi email đặt lại mật khẩu chưa sẵn sàng. Hãy cấu hình Gmail SMTP trong backend trước.
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <Button
            type="submit"
            className="w-full py-3"
            disabled={submitting || providersLoading || !providers.smtpConfigured}
          >
            {submitting ? 'Đang gửi mã...' : 'Gửi mã OTP'}
          </Button>
        </form>

        <p className="mt-6 text-sm text-slate-500">
          <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-700">
            Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;