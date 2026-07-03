import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import HomePage from '../pages/HomePage';
import MyProfilePage from '../pages/MyProfilePage';
import MyPostsPage from '../pages/MyPostsPage';
import UserProfilePage from '../pages/UserProfilePage';
import PostDetailPage from '../pages/PostDetailPage';
import NotFoundPage from '../pages/NotFoundPage';
import OAuth2CallbackPage from '../pages/OAuth2CallbackPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import VerifyEmailPage from '../pages/VerifyEmailPage';
import SearchUsersPage from '../pages/SearchUsersPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminStaffPage from '../pages/admin/AdminStaffPage';
import AdminPostsPage from '../pages/admin/AdminPostsPage';
import AdminCommentsPage from '../pages/admin/AdminCommentsPage';
import AdminReportsPage from '../pages/admin/AdminReportsPage';
import AdminBannedWordsPage from '../pages/admin/AdminBannedWordsPage';
import AdminAccountDeletionRequestsPage from '../pages/admin/AdminAccountDeletionRequestsPage';

const PrivateLayout = ({ children }) => (
  <ProtectedRoute>
    <MainLayout>{children}</MainLayout>
  </ProtectedRoute>
);

const AdminPrivate = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/auth/oauth2/callback" element={<OAuth2CallbackPage />} />

      <Route path="/" element={<PrivateLayout><HomePage /></PrivateLayout>} />
      <Route path="/profile" element={<PrivateLayout><MyProfilePage /></PrivateLayout>} />
      <Route path="/my-posts" element={<PrivateLayout><MyPostsPage /></PrivateLayout>} />
      <Route path="/user/:id" element={<PrivateLayout><UserProfilePage /></PrivateLayout>} />
      <Route path="/search" element={<PrivateLayout><SearchUsersPage /></PrivateLayout>} />
      <Route path="/posts/:id" element={<PrivateLayout><PostDetailPage /></PrivateLayout>} />

      <Route path="/admin" element={<AdminPrivate><AdminDashboardPage /></AdminPrivate>} />
      <Route path="/admin/users" element={<AdminPrivate><AdminUsersPage /></AdminPrivate>} />
      <Route path="/admin/account-deletion-requests" element={<AdminPrivate><AdminAccountDeletionRequestsPage /></AdminPrivate>} />
      <Route path="/admin/staff" element={<AdminPrivate><AdminStaffPage /></AdminPrivate>} />
      <Route path="/admin/posts" element={<AdminPrivate><AdminPostsPage /></AdminPrivate>} />
      <Route path="/admin/comments" element={<AdminPrivate><AdminCommentsPage /></AdminPrivate>} />
      <Route path="/admin/reports" element={<AdminPrivate><AdminReportsPage /></AdminPrivate>} />
      <Route path="/admin/banned-words" element={<AdminPrivate><AdminBannedWordsPage /></AdminPrivate>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
