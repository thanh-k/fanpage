import { useEffect, useRef, useState } from 'react';
import Avatar from '../common/Avatar';
import chatService from '../../services/chatService';

const ChatWindow = ({ friend, onClose, realtimeReady, onlineUserIds, incomingMessage, sendRealtime, onConversationRead, onMessageChanged }) => {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  const isFriendOnline = onlineUserIds?.has(friend.id) || friend.online;

  const markRead = async () => {
    try {
      await chatService.markConversationAsRead(friend.id);
      onConversationRead?.(friend.id);
    } catch (err) {}
  };

  const loadMessages = async () => {
    try {
      setError('');
      const data = await chatService.getConversation(friend.id, 50);
      setMessages(data);
      await markRead();
    } catch (err) {
      setError(err?.message || 'Không thể tải tin nhắn.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (friend?.id) {
      setLoading(true);
      loadMessages();
    }
  }, [friend?.id]);

  useEffect(() => {
    if (!incomingMessage || incomingMessage.peerId !== friend.id) return;
    setMessages((prev) => {
      if (prev.some((item) => item.id === incomingMessage.id)) return prev;
      return [...prev, incomingMessage];
    });
    if (!incomingMessage.mine) markRead();
  }, [incomingMessage?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleRevoke = async (messageId) => {
    try {
      const revoked = await chatService.revokeMessage(messageId);
      setMessages((prev) => prev.map((item) => item.id === messageId ? { ...item, ...revoked, revoked: true, content: 'Tin nhắn đã được thu hồi' } : item));
      onMessageChanged?.(revoked);
    } catch (err) {
      setError(err?.message || 'Không thể thu hồi tin nhắn.');
    }
  };

  const handleSend = async (event) => {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    setSending(true);
    setError('');

    try {
      const sentBySocket = sendRealtime?.(friend.id, trimmed);
      if (!sentBySocket) {
        const sent = await chatService.sendMessage(friend.id, trimmed);
        setMessages((prev) => [...prev, sent]);
        onMessageChanged?.(sent);
      }
      setContent('');
    } catch (err) {
      setError(err?.message || 'Không thể gửi tin nhắn.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-x-2 bottom-2 z-40 flex max-h-[78vh] min-h-[420px] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl sm:inset-x-auto sm:bottom-5 sm:right-6 sm:h-[520px] sm:w-[360px] sm:rounded-[28px]">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative">
            <Avatar
              src={friend.avatar}
              name={friend.name}
              provider={friend.provider}
              size="md"
            />
            {isFriendOnline ? <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" /> : null}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">{friend.name}</p>
            <p className={['text-xs', isFriendOnline ? 'text-emerald-500' : 'text-slate-400'].join(' ')}>
              {isFriendOnline ? 'Đang hoạt động' : realtimeReady ? 'Không hoạt động' : 'Đang dùng chế độ dự phòng'}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="rounded-full px-3 py-1 text-xl font-bold text-slate-500 hover:bg-slate-100">×</button>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50 px-3 py-3 sm:px-4 sm:py-4">
        {loading ? <p className="text-center text-sm text-slate-500">Đang tải tin nhắn...</p> : null}
        {error ? <p className="rounded-2xl bg-rose-50 p-3 text-sm text-rose-600">{error}</p> : null}
        {!loading && !messages.length ? <p className="text-center text-sm text-slate-500">Hãy bắt đầu cuộc trò chuyện.</p> : null}
        {messages.map((message, index) => {
          const isLastMine = message.mine && index === messages.length - 1;
          const wrapperClass = ['flex', message.mine ? 'justify-end' : 'justify-start'].join(' ');
          const bubbleClass = [
            'rounded-[22px] px-4 py-2 text-sm leading-6',
            message.mine ? 'bg-sky-500 text-white' : 'bg-white text-slate-700 shadow-sm'
          ].join(' ');
          return (
            <div key={message.id} className={wrapperClass}>
              <div className="max-w-[82%] sm:max-w-[75%]">
                <div className={message.revoked ? bubbleClass + ' italic opacity-75' : bubbleClass}>{message.revoked ? 'Tin nhắn đã được thu hồi' : message.content}</div>
                {message.mine && !message.revoked ? <button type="button" onClick={() => handleRevoke(message.id)} className="mt-1 text-[11px] font-semibold text-slate-400 hover:text-rose-500">Thu hồi</button> : null}
                {isLastMine ? <p className="mt-1 text-right text-[11px] text-slate-400">{message.read ? 'Đã xem' : 'Đã gửi'}</p> : null}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-slate-100 bg-white p-2.5 sm:p-3">
        <input
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Aa"
          className="min-w-0 flex-1 rounded-full bg-slate-100 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-100"
        />
        <button type="submit" disabled={sending || !content.trim()} className="rounded-full bg-sky-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
          Gửi
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
