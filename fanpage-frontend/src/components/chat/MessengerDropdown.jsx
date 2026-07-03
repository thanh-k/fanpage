import { useEffect, useMemo, useRef, useState } from 'react';
import Avatar from '../common/Avatar';
import friendService from '../../services/friendService';

const formatTimeAgo = (value) => {
  if (!value) return '';
  const time = new Date(value).getTime();
  const diff = Date.now() - time;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return 'vừa xong';
  if (diff < hour) return `${Math.floor(diff / minute)} phút`;
  if (diff < day) return `${Math.floor(diff / hour)} giờ`;
  return `${Math.floor(diff / day)} ngày`;
};

const MessengerDropdown = ({ conversations, unreadCount, onlineUserIds, onOpenChat, onRefresh }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(5);
  const [friends, setFriends] = useState([]);
  const wrapperRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setVisibleCount(5);
      onRefresh?.();
      friendService.getFriends().then(setFriends).catch(() => setFriends([]));
    }
  };

  const handleOpenChat = (conversation) => {
    onOpenChat?.(conversation.user);
    setOpen(false);
    setSearchTerm('');
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const conversationMatches = useMemo(() => {
    const list = Array.isArray(conversations) ? conversations : [];
    if (!normalizedSearch) return list;
    return list.filter((conversation) => {
      const user = conversation.user || {};
      return [user.name, user.username, conversation.lastMessage]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch));
    });
  }, [conversations, normalizedSearch]);

  const friendMatches = useMemo(() => {
    if (!normalizedSearch) return [];
    const conversationUserIds = new Set(conversationMatches.map((item) => item.user?.id));
    return friends
      .filter((friend) => !conversationUserIds.has(friend.id))
      .filter((friend) => [friend.name, friend.username, friend.fullName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch)))
      .slice(0, 5);
  }, [friends, conversationMatches, normalizedSearch]);

  const visibleConversations = normalizedSearch
    ? conversationMatches
    : conversationMatches.slice(0, visibleCount);

  const hasMore = !normalizedSearch && visibleCount < conversationMatches.length;

  const handleScroll = () => {
    const element = listRef.current;
    if (!element || !hasMore) return;
    const nearBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 24;
    if (nearBottom) {
      setVisibleCount((count) => Math.min(count + 5, conversationMatches.length));
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-xl text-sky-600 transition hover:bg-sky-100"
        title="Tin nhắn"
      >
        💬
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 min-w-[20px] rounded-full bg-rose-500 px-1.5 py-0.5 text-center text-[11px] font-bold leading-none text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed left-3 right-3 top-[132px] z-50 max-h-[70vh] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-14 sm:w-[360px] sm:max-h-none sm:rounded-[28px]">
          <div className="flex items-center justify-between px-4 py-3 sm:py-4">
            <h2 className="text-xl font-black text-slate-900 sm:text-2xl">Đoạn chat</h2>
            <button
              type="button"
              onClick={onRefresh}
              className="rounded-full px-3 py-1 text-sm font-bold text-slate-500 hover:bg-slate-100"
            >
              Làm mới
            </button>
          </div>

          <div className="px-4 pb-3">
            <input
              value={searchTerm}
              onChange={(event) => { setSearchTerm(event.target.value); setVisibleCount(5); }}
              className="w-full rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
              placeholder="Tìm kiếm trên Messenger"
            />
          </div>

          <div ref={listRef} onScroll={handleScroll} className="max-h-[50vh] overflow-y-auto px-2 pb-3 sm:max-h-[460px]">
            {normalizedSearch && friendMatches.length ? (
              <div className="px-2 pb-1 pt-2 text-[11px] font-black uppercase tracking-wider text-slate-400">Bạn bè</div>
            ) : null}

            {friendMatches.map((friend) => (
              <button
                type="button"
                key={`friend-${friend.id}`}
                onClick={() => { onOpenChat?.(friend); setOpen(false); setSearchTerm(''); }}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-sky-50"
              >
                <Avatar src={friend.avatar} name={friend.name} provider={friend.provider} size="lg" className="h-14 w-14" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-slate-900">{friend.name}</span>
                  <span className="block truncate text-sm text-slate-500">Bạn bè · Ấn để nhắn tin</span>
                </span>
              </button>
            ))}

            {normalizedSearch && visibleConversations.length ? (
              <div className="px-2 pb-1 pt-2 text-[11px] font-black uppercase tracking-wider text-slate-400">Tin nhắn</div>
            ) : null}

            {!visibleConversations.length && !friendMatches.length ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">Chưa có đoạn chat nào.</p>
            ) : null}

            {visibleConversations.map((conversation) => {
              const user = conversation.user;
              const isOnline = onlineUserIds.has(user.id) || conversation.online;
              return (
                <button
                  type="button"
                  key={conversation.conversationId}
                  onClick={() => handleOpenChat(conversation)}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-slate-50"
                >
                  <span className="relative shrink-0">
                    <Avatar
                      src={user.avatar}
                      name={user.name}
                      provider={user.provider}
                      size="lg"
                      className="h-14 w-14"
                    />
                    {isOnline ? <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" /> : null}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-bold text-slate-900">{user.name}</span>
                      <span className="shrink-0 text-[11px] text-slate-400">{formatTimeAgo(conversation.lastMessageAt)}</span>
                    </span>
                    <span className={`block truncate text-sm ${conversation.unreadCount > 0 ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                      {conversation.unreadCount > 0 ? 'Chưa đọc: ' : ''}{conversation.lastMessage || 'Bắt đầu trò chuyện'}
                    </span>
                  </span>

                  {conversation.unreadCount > 0 ? (
                    <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-sky-500 px-2 text-xs font-bold text-white">
                      {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </span>
                  ) : null}
                </button>
              );
            })}

            {hasMore ? (
              <div className="px-3 py-2 text-center text-xs font-semibold text-slate-400">Cuộn xuống để tải thêm...</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MessengerDropdown;
