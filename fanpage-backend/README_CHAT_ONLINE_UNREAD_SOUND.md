# Cập nhật chat realtime MongoDB

Đã thêm:
- Chấm xanh online/offline theo WebSocket connection.
- Danh sách đoạn chat khi bấm icon tin nhắn ở navbar.
- Tổng số tin nhắn chưa đọc giống Facebook.
- Unread count theo từng đoạn chat.
- Đánh dấu đã đọc khi mở đoạn chat.
- Trạng thái tin nhắn gửi đi: Đã gửi / Đã xem.
- Âm thanh khi có tin nhắn mới.

File âm thanh đã được lưu tại frontend:
public/sounds/messenger.mp3

API mới:
GET  /api/chats/conversations
GET  /api/chats/unread-count
GET  /api/chats/online-users
POST /api/chats/{userId}/read

WebSocket events mới:
ONLINE_USERS
USER_ONLINE
USER_OFFLINE
CHAT_MESSAGE
