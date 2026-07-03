import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-50 text-slate-600">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
