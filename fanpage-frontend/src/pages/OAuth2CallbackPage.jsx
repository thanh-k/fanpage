import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuth2CallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGoogleToken } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const oauthError = searchParams.get('error');

      if (oauthError) {
        setError(decodeURIComponent(oauthError));
        return;
      }

      if (!token) {
        setError('Không nhận được token đăng nhập từ Google.');
        return;
      }

      try {
        await loginWithGoogleToken(token);
        navigate('/', { replace: true });
      } catch (callbackError) {
        setError(callbackError.message || 'Đăng nhập Google thất bại.');
      }
    };

    handleCallback();
  }, [loginWithGoogleToken, navigate, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft">
        <h1 className="text-2xl font-bold text-slate-900">Đăng nhập với Google</h1>
        {error ? (
          <div>
            <p className="mt-4 text-sm text-rose-600">{error}</p>
            <button
              type="button"
              onClick={() => navigate('/login', { replace: true })}
              className="mt-6 rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              Quay lại đăng nhập
            </button>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Đang xác thực tài khoản, vui lòng chờ...</p>
        )}
      </div>
    </div>
  );
};

export default OAuth2CallbackPage;
