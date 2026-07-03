import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../context/AuthContext';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, authLoading, verifyRegisterOtp, confirmPasswordReset } = useAuth();

  const purpose = searchParams.get('purpose') || 'register';
  const email = searchParams.get('email') || '';
  const [form, setForm] = useState({
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isResetPassword = useMemo(() => purpose === 'reset-password', [purpose]);

  if (!authLoading && isAuthenticated && !isResetPassword) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      if (!email) {
        throw new Error('Thiếu email để xác thực.');
      }

      if (isResetPassword) {
        if (form.newPassword !== form.confirmPassword) {
          throw new Error('Xác nhận mật khẩu không khớp.');
        }

        await confirmPasswordReset({
          email,
          code: form.code,
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword
        });

        setSuccess('Đặt lại mật khẩu thành công. Bạn có thể đăng nhập ngay bây giờ.');
        setTimeout(() => navigate('/login', { replace: true }), 1200);
        return;
      }

      await verifyRegisterOtp({ email, code: form.code });
      navigate('/', { replace: true });
    } catch (submitError) {
      setError(submitError.message || 'Không thể xác thực mã OTP.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f8fdff_0%,#eef8ff_100%)] px-4 py-10">
      <div className="w-full max-w-lg rounded-[32px] border border-white/80 bg-white/90 p-6 shadow-soft sm:p-10">
        <div className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-200">
          Xác thực email
        </div>

        <h1 className="mt-4 text-3xl font-bold text-slate-900">
          {isResetPassword ? 'Nhập mã đặt lại mật khẩu' : 'Nhập mã xác thực đăng ký'}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Mã OTP 6 số đã được gửi tới <span className="font-semibold text-slate-700">{email || 'email của bạn'}</span>.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Input
            label="Mã OTP"
            name="code"
            maxLength={6}
            placeholder="Nhập 6 chữ số"
            value={form.code}
            onChange={handleChange}
          />

          {isResetPassword ? (
            <>
              <Input
                label="Mật khẩu mới"
                name="newPassword"
                type="password"
                placeholder="Nhập mật khẩu mới"
                value={form.newPassword}
                onChange={handleChange}
              />
              <Input
                label="Xác nhận mật khẩu mới"
                name="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </>
          ) : null}

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

          <Button type="submit" className="w-full py-3" disabled={submitting}>
            {submitting ? 'Đang xác thực...' : 'Xác thực'}
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

export default VerifyEmailPage;
