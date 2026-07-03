import { useCallback, useEffect, useRef, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import FriendSidebar from '../components/chat/FriendSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import chatService from '../services/chatService';

const MESSAGE_SOUND_URL = '/sounds/messenger.mp3';

const MainLayout = ({ children }) => {
  const [activeChatFriend, setActiveChatFriend] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [realtimeReady, setRealtimeReady] = useState(false);
  const [lastRealtimeMessage, setLastRealtimeMessage] = useState(null);
  const socketRef = useRef(null);
  const activeChatFriendRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    activeChatFriendRef.current = activeChatFriend;
  }, [activeChatFriend]);

  useEffect(() => {
    audioRef.current = new Audio(MESSAGE_SOUND_URL);
    audioRef.current.volume = 0.7;
  }, []);

  const playMessageSound = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  const loadConversations = useCallback(async () => {
    try {
      const data = await chatService.getConversations();
      setConversations(data);
    } catch (err) {}
  }, []);

  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await chatService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {}
  }, []);

  const refreshChatData = useCallback(async () => {
    await Promise.all([loadConversations(), loadUnreadCount()]);
  }, [loadConversations, loadUnreadCount]);

  useEffect(() => {
    refreshChatData();

    try {
      const socket = chatService.connectRealtime({
        onOpen: () => setRealtimeReady(true),
        onClose: () => setRealtimeReady(false),
        onError: () => setRealtimeReady(false),
        onOnlineUsers: (ids) => setOnlineUserIds(new Set(ids)),
        onUserOnline: (id) => setOnlineUserIds((prev) => new Set([...prev, id])),
        onUserOffline: (id) => setOnlineUserIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        }),
        onMessage: async (message) => {
          if (!message) return;
          setLastRealtimeMessage(message);

          const activeFriend = activeChatFriendRef.current;
          const isActiveConversation = activeFriend && message.peerId === activeFriend.id;

          if (!message.mine) {
            playMessageSound();
            if (isActiveConversation) {
              await chatService.markConversationAsRead(message.peerId);
            }
          }

          await refreshChatData();
        }
      });
      socketRef.current = socket;
    } catch (err) {}

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [refreshChatData]);

  const handleOpenChat = async (friend) => {
    setActiveChatFriend(friend);
    try {
      await chatService.markConversationAsRead(friend.id);
      await refreshChatData();
    } catch (err) {}
  };

  const handleConversationRead = async () => {
    await refreshChatData();
  };

  const sendRealtime = (receiverId, content) => {
    return chatService.sendRealtime(socketRef.current, receiverId, content);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        conversations={conversations}
        unreadCount={unreadCount}
        onlineUserIds={onlineUserIds}
        onOpenChat={handleOpenChat}
        onRefreshConversations={refreshChatData}
      />
      <main className="mx-auto flex max-w-7xl items-start gap-6 px-2.5 py-4 sm:px-4 sm:py-6">
        <div className="min-w-0 flex-1">{children}</div>
        <FriendSidebar conversations={conversations} onlineUserIds={onlineUserIds} onOpenChat={handleOpenChat} />
      </main>

      {activeChatFriend ? (
        <ChatWindow
          friend={activeChatFriend}
          onClose={() => setActiveChatFriend(null)}
          realtimeReady={realtimeReady}
          onlineUserIds={onlineUserIds}
          incomingMessage={lastRealtimeMessage}
          sendRealtime={sendRealtime}
          onConversationRead={handleConversationRead}
          onMessageChanged={refreshChatData}
        />
      ) : null}
    </div>
  );
};

export default MainLayout;
