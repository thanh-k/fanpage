import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import friendService from '../../services/friendService';
import Avatar from '../common/Avatar';

const FriendSidebar = ({ onlineUserIds, onOpenChat, conversations = [] }) => {
  const [friends, setFriends] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [friendsData, requestsData] = await Promise.all([
        friendService.getFriends(),
        friendService.getReceivedRequests()
      ]);
      setFriends(friendsData);
      setReceivedRequests(requestsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAccept = async (requestId) => {
    await friendService.acceptRequest(requestId);
    await loadData();
  };

  const handleReject = async (requestId) => {
    await friendService.rejectRequest(requestId);
    await loadData();
  };

  const recentChatFriends = conversations
    .filter((conversation) => conversation?.user)
    .slice(0, 5)
    .map((conversation) => ({
      ...conversation.user,
      lastMessage: conversation.lastMessage,
      lastMessageAt: conversation.lastMessageAt,
      unreadCount: conversation.unreadCount,
      online: conversation.online || conversation.user?.online
    }));

  return (
    <aside className="sticky top-[118px] hidden max-h-[calc(100vh-132px)] w-80 shrink-0 self-start overflow-y-auto pr-1 xl:block">
      <div className="space-y-4">
        <section className="rounded-[28px] border border-white/80 bg-white/90 p-4 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Bạn bè</h2>
            <Link to="/search" className="text-xs font-semibold text-sky-600 hover:text-sky-700">Tìm bạn</Link>
          </div>

          {loading ? <p className="text-sm text-slate-500">Đang tải...</p> : null}
          {!loading && !recentChatFriends.length ? <p className="text-sm text-slate-500">Chưa có bạn bè đã nhắn tin gần đây.</p> : null}

          <div className="space-y-2">
            {recentChatFriends.map((friend) => {
              const isOnline = onlineUserIds?.has(friend.id) || friend.online;
              return (
                <button
                  key={friend.id}
                  onClick={() => onOpenChat?.(friend)}
                  className="flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left transition hover:bg-sky-50"
                >
                  <span className="relative">
                    <Avatar
                      src={friend.avatar}
                      name={friend.name}
                      provider={friend.provider}
                      size="md"
                    />
                    {isOnline ? <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" /> : null}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-800">{friend.name}</span>
                    <span className="block truncate text-xs text-slate-500">{isOnline ? 'Đang hoạt động' : 'Ấn để nhắn tin'}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {receivedRequests.length ? (
          <section className="rounded-[28px] border border-white/80 bg-white/90 p-4 shadow-soft">
            <h2 className="mb-3 text-base font-bold text-slate-900">Lời mời kết bạn</h2>
            <div className="space-y-3">
              {receivedRequests.map((request) => (
                <div key={request.id} className="rounded-2xl bg-slate-50 p-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={request.requester.avatar} name={request.requester.name} provider={request.requester.provider} size="md" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{request.requester.name}</p>
                      <p className="text-xs text-slate-500">muốn kết bạn</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button onClick={() => handleAccept(request.id)} className="rounded-xl bg-sky-500 py-2 text-xs font-bold text-white">Đồng ý</button>
                    <button onClick={() => handleReject(request.id)} className="rounded-xl bg-white py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-200">Xóa</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </aside>
  );
};

export default FriendSidebar;
