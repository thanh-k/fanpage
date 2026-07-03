import apiClient from './apiClient';
import authService from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || SERVER_BASE_URL.replace(/^http/, 'ws');

const normalizeUser = (user) => ({
  ...user,
  avatar: user?.avatar || null,
  name: user?.name || user?.fullName || 'Người dùng',
  bio: user?.bio || '',
  online: Boolean(user?.online)
});

const normalizeConversation = (conversation) => ({
  ...conversation,
  user: normalizeUser(conversation.user),
  unreadCount: Number(conversation.unreadCount || 0),
  online: Boolean(conversation.online || conversation.user?.online)
});

const chatService = {
  async getConversation(userId, limit = 50) {
    const response = await apiClient.get(`/chats/${userId}/messages?limit=${limit}`);
    return response.data || [];
  },

  async getConversations(limit, offset = 0) {
    const query = limit ? `?limit=${limit}&offset=${offset}` : '';
    const response = await apiClient.get(`/chats/conversations${query}`);
    return (response.data || []).map(normalizeConversation);
  },

  async getUnreadCount() {
    const response = await apiClient.get('/chats/unread-count');
    return Number(response.data?.count || 0);
  },

  async getOnlineUsers() {
    const response = await apiClient.get('/chats/online-users');
    return response.data || [];
  },

  async markConversationAsRead(userId) {
    const response = await apiClient.post(`/chats/${userId}/read`, {});
    return Number(response.data?.count || 0);
  },

  async sendMessage(userId, content) {
    const response = await apiClient.post(`/chats/${userId}/messages`, { content });
    return response.data;
  },

  async revokeMessage(messageId) {
    const response = await apiClient.post(`/chats/messages/${messageId}/revoke`, {});
    return response.data;
  },

  connectRealtime({ onMessage, onError, onOpen, onClose, onOnlineUsers, onUserOnline, onUserOffline } = {}) {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Bạn cần đăng nhập để dùng chat realtime.');
    }

    const wsUrl = `${WS_BASE_URL.replace(/\/$/, '')}/ws/chat?token=${encodeURIComponent(token)}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      onOpen?.();
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'CHAT_MESSAGE') {
          onMessage?.(payload.data);
        } else if (payload.type === 'ONLINE_USERS') {
          onOnlineUsers?.(payload.data || []);
        } else if (payload.type === 'USER_ONLINE') {
          onUserOnline?.(payload.data);
        } else if (payload.type === 'USER_OFFLINE') {
          onUserOffline?.(payload.data);
        } else if (payload.type === 'ERROR') {
          onError?.(payload.message || 'Chat realtime bị lỗi.');
        }
      } catch (error) {
        onError?.('Không đọc được dữ liệu chat realtime.');
      }
    };

    socket.onerror = () => {
      onError?.('Không thể kết nối chat realtime.');
    };

    socket.onclose = () => {
      onClose?.();
    };

    return socket;
  },

  sendRealtime(socket, receiverId, content) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    socket.send(JSON.stringify({
      type: 'CHAT_MESSAGE',
      receiverId,
      content
    }));

    return true;
  }
};

export default chatService;
