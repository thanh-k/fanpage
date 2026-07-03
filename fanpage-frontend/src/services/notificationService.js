import apiClient from './apiClient';
const unwrap=(r)=>r?.data?.data ?? r?.data ?? r;
export default {
 getMyNotifications:()=>apiClient.get('/notifications').then(unwrap),
 getUnreadCount:()=>apiClient.get('/notifications/unread-count').then(unwrap),
 markAsRead:(id)=>apiClient.put(`/notifications/${id}/read`).then(unwrap),
 markAllAsRead:()=>apiClient.put('/notifications/read-all').then(unwrap),
};
