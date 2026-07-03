import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../../services/notificationService';
import localStorageService from '../../services/localStorageService';
import { STORAGE_KEYS } from '../../utils/storageKeys';
import { removePostFromFeedCache } from '../../utils/feedNavigationCache';

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';

const getNotificationIcon = (type) => {
  if (type === 'POST_LIKE') return '❤️';
  if (type === 'POST_COMMENT') return '💬';
  if (type === 'POST_DELETED' || type === 'POST_DELETED_BY_ADMIN' || type === 'COMMENT_DELETED') return '⚠️';
  return '🔔';
};

const DELETED_POST_NOTIFICATION_TYPES = new Set(['POST_DELETED', 'POST_DELETED_BY_ADMIN']);

const extractDeletedPostId = (notification) => {
  if (!notification || !DELETED_POST_NOTIFICATION_TYPES.has(notification.type)) return null;

  const directId = notification.targetId ?? notification.postId ?? notification.targetPostId;
  if (directId !== undefined && directId !== null && String(directId).trim()) {
    return String(directId);
  }

  const urlMatch = String(notification.redirectUrl || '').match(/\/posts\/(\d+)/);
  return urlMatch ? urlMatch[1] : null;
};

const publishDeletedPostNotification = (notification) => {
  const postId = extractDeletedPostId(notification);
  if (!postId) return;

  removePostFromFeedCache(postId);
  window.dispatchEvent(new CustomEvent('fanpage:post-deleted', {
    detail: { postId, notification }
  }));
};

const NotificationBell = ({ currentUserId }) => {
  const navigate = useNavigate();
  const wsRef = useRef(null);
  const wrapperRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!currentUserId) return;

      try {
        const historyData = await notificationService.getMyNotifications();
        const safeHistory = Array.isArray(historyData) ? historyData : [];

        setNotifications(safeHistory);
        setUnreadCount(safeHistory.filter((item) => !item.read).length);

        // Nếu bài đã bị admin xóa khi user đang offline hoặc vừa reload trang,
        // thông báo lịch sử vẫn phải làm sạch cache/feed đang hiển thị.
        safeHistory.forEach(publishDeletedPostNotification);
        [150, 500, 1200, 2500].forEach((delay) => {
          setTimeout(() => safeHistory.forEach(publishDeletedPostNotification), delay);
        });
      } catch (err) {
        console.error('Không thể tải thông báo:', err);
      }
    };

    loadNotifications();
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;

    const token = localStorageService.get(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) return;

    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const socket = new WebSocket(
      `${WS_BASE_URL}/ws/notifications?token=${encodeURIComponent(token)}`
    );

    wsRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const newNotification = JSON.parse(event.data);

        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        publishDeletedPostNotification(newNotification);

        const audio = new Audio('/sounds/messenger.mp3');
        audio.play().catch(() => {});
      } catch (err) {
        console.error('Lỗi parse notification:', err);
      }
    };

    socket.onerror = (err) => {
      console.error('Notification socket error:', err);
    };

    socket.onclose = () => {
      wsRef.current = null;
    };

    return () => {
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;

      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        socket.close();
      }

      wsRef.current = null;
    };
  }, [currentUserId]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        await notificationService.markAsRead(notification.id);

        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id ? { ...item, read: true } : item
          )
        );

        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }
    } catch (err) {
      console.error('Không thể đánh dấu đã đọc:', err);
    }

    const redirectUrl = notification.redirectUrl || `/posts/${notification.targetId}`;

    setIsOpen(false);
    navigate(redirectUrl);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={handleToggle}
        className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-xl text-amber-600 transition hover:bg-amber-100"
      >
        <span className="text-xl">🔔</span>

        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed left-3 right-3 top-[132px] z-50 max-h-[70vh] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-14 sm:w-[380px] sm:max-h-none sm:rounded-[28px]">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:py-4">
            <h3 className="text-xl font-black text-slate-900 sm:text-2xl">Thông báo</h3>

            {unreadCount > 0 && (
              <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded-full">
                {unreadCount} mới
              </span>
            )}
          </div>

          <div className="max-h-[55vh] divide-y divide-slate-50 overflow-y-auto px-2 pb-3 sm:max-h-[460px]">
            {notifications.length === 0 ? (
              <p className="py-6 text-center text-xs font-medium text-slate-400 italic">
                Bạn chưa nhận được thông báo nào.
              </p>
            ) : (
              notifications.map((notification) => (
                <button
                  type="button"
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left py-3 px-3 rounded-2xl transition-all ${
                    notification.read
                      ? 'bg-white hover:bg-slate-50'
                      : 'bg-sky-50/70 hover:bg-sky-50 border border-sky-100'
                  }`}
                >
                  <div className="flex gap-3">
                    <span className="mt-0.5 text-lg">
                      {getNotificationIcon(notification.type)}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-700 leading-relaxed">
                        <span className="font-black text-slate-950 mr-1">
                          {notification.senderName}
                        </span>
                        {notification.message}
                      </p>

                      <p className="mt-1 text-[10px] font-medium text-slate-400">
                        {notification.createdAt
                          ? new Date(notification.createdAt).toLocaleString('vi-VN')
                          : ''}
                      </p>
                    </div>

                    {!notification.read && (
                      <span className="mt-2 h-2 w-2 rounded-full bg-sky-500" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
