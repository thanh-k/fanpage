# MongoDB + realtime chat

## 1. MongoDB Compass

Kết nối local:

```txt
mongodb://localhost:27017
```

Tạo database:

```txt
fanpage_chat_db
```

Tạo 2 collection:

```txt
chat_messages
conversations
```

## 2. Backend config

`src/main/resources/application.yml` đã có:

```yml
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/fanpage_chat_db
```

`pom.xml` đã thêm:

```xml
spring-boot-starter-data-mongodb
spring-boot-starter-websocket
```

## 3. Chạy backend

Nên đặt project ở đường dẫn không dấu, ví dụ:

```txt
E:\DuAnCaNhan\Fanpage\fanpage-backend
```

Chạy:

```powershell
mvn clean spring-boot:run
```

## 4. Chạy frontend

```powershell
npm install
npm run dev
```

FE dùng WebSocket endpoint:

```txt
ws://localhost:8080/ws/chat?token=<JWT_TOKEN>
```

## 5. Luồng hoạt động

- REST `GET /api/chats/{userId}/messages` lấy lịch sử chat từ MongoDB.
- WebSocket `/ws/chat` gửi/nhận tin nhắn realtime.
- BE kiểm tra JWT trong query `token`.
- BE kiểm tra 2 user đã là bạn bè mới cho nhắn tin.
- Tin nhắn được lưu vào collection `chat_messages`.
- Conversation được cập nhật trong collection `conversations`.

## 6. Dữ liệu trả về FE

BE không trả `senderId`, `receiverId` ra FE. FE chỉ nhận:

```json
{
  "id": "...",
  "conversationId": "56_57",
  "content": "Xin chào",
  "mine": true,
  "read": false,
  "createdAt": "2026-04-28T09:30:00"
}
```
