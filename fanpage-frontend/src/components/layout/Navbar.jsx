import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import MessengerDropdown from '../chat/MessengerDropdown';
import NotificationBell from '../notificationBell/NotificationBell';

const navClass = ({ isActive }) =>
  `inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-2xl px-2 text-sm font-bold transition md:h-12 md:min-w-[112px] md:flex-none md:px-4 ${
    isActive
      ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-md shadow-sky-100'
      : 'text-slate-600 hover:bg-sky-50 hover:text-sky-700'
  }`;

const Navbar = ({ conversations, unreadCount, onlineUserIds, onOpenChat, onRefreshConversations }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const profileRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-3 py-3 md:px-4 md:py-4">
        <div className="flex items-center justify-between gap-3">
          <NavLink to="/" className="inline-flex min-w-0 items-center gap-2 text-lg font-black text-slate-900 dark:text-white sm:gap-3 sm:text-xl">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-cyan-400 to-emerald-300 text-white shadow-md shadow-sky-100">
              D
            </span>
            <span className="truncate sm:hidden">Fanpage</span>
            <span className="hidden truncate sm:inline">Discussion Board</span>
          </NavLink>

          <div ref={profileRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-2 py-1.5 ring-1 ring-sky-100 transition hover:bg-sky-50 sm:px-3"
              title="Tài khoản"
            >
              <Avatar
                src={currentUser?.avatar}
                name={currentUser?.name}
                provider={currentUser?.provider}
                size="lg"
                className="h-10 w-10"
              />
              <div className="hidden min-w-0 text-left sm:block">
                <p className="truncate text-sm font-bold text-slate-800">{currentUser?.name}</p>
                <p className="truncate text-xs text-slate-500">@{currentUser?.username}</p>
              </div>
              <span className="text-xs text-slate-400">⌄</span>
            </button>

            {profileOpen ? (
              <div className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-[24px] border border-slate-100 bg-white p-2 shadow-2xl">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                  <Avatar
                    src={currentUser?.avatar}
                    name={currentUser?.name}
                    provider={currentUser?.provider}
                    size="lg"
                    className="h-12 w-12"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-900 dark:text-white">{currentUser?.name}</p>
                    <p className="truncate text-xs text-slate-500">@{currentUser?.username}</p>
                  </div>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="mt-2 flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700"
                >
                  <span>👤</span>
                  <span>Trang hồ sơ</span>
                </Link>
                <Link
                  to="/my-posts"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700"
                >
                  <span>📝</span>
                  <span>Bài viết của tôi</span>
                </Link>
                {['STAFF', 'SUPER_ADMIN'].includes(currentUser?.role) ? (
                  <Link
                    to="/admin"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700"
                  >
                    <span>⚙️</span>
                    <span>Quản trị</span>
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={() => setDarkMode((prev) => !prev)}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <span>{darkMode ? '☀️' : '🌙'}</span>
                  <span>{darkMode ? 'Chế độ sáng' : 'Chế độ tối'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-bold text-rose-600 hover:bg-rose-50"
                >
                  <span>↪</span>
                  <span>Đăng xuất</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <nav className="grid grid-cols-4 items-center gap-1 rounded-2xl bg-white/80 p-1.5 ring-1 ring-sky-100 md:mx-auto md:flex md:w-auto md:gap-2 md:p-2">
          <NavLink to="/" className={navClass} title="Trang chủ">
            <span>🏠</span>
            <span className="hidden md:inline">Trang chủ</span>
          </NavLink>

          <div className="flex h-11 items-center justify-center rounded-2xl text-slate-600 transition hover:bg-sky-50 hover:text-sky-700 md:h-12 md:min-w-[112px]">
            <MessengerDropdown
              conversations={conversations}
              unreadCount={unreadCount}
              onlineUserIds={onlineUserIds}
              onOpenChat={onOpenChat}
              onRefresh={onRefreshConversations}
            />
          </div>

          <div className="flex h-11 items-center justify-center rounded-2xl text-slate-600 transition hover:bg-sky-50 hover:text-sky-700 md:h-12 md:min-w-[112px]">
            <NotificationBell currentUserId={currentUser?.id} />
          </div>

          <NavLink to="/search" className={navClass} title="Tìm kiếm">
            <span>🔎</span>
            <span className="hidden md:inline">Tìm kiếm</span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
