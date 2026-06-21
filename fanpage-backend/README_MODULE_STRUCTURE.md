# Fanpage Backend - Module Structure

Dự án đã được cấu trúc lại theo hướng `modules` giống ecommerce-backend để dễ quản lý và mở rộng.

## Cấu trúc chính

```text
src/main/java/com/example/fanpagebackend
├── common                  # Enum, response chung, class dùng toàn hệ thống
├── config                  # Cấu hình CORS, JPA, MongoDB, upload, WebSocket
├── exception               # Exception và GlobalExceptionHandler
├── security                # JWT, Spring Security, OAuth2 Google
├── util                    # Tiện ích dùng chung
└── modules
    ├── auth                # Đăng ký, đăng nhập, OTP, OAuth2
    ├── user                # Hồ sơ cá nhân, tìm kiếm user
    ├── post                # Bài viết, media bài viết
    ├── comment             # Bình luận
    ├── like                # Like / unlike bài viết
    ├── friend              # Kết bạn, lời mời kết bạn
    ├── chat                # Chat, MongoDB document, WebSocket realtime
    ├── admin               # Dashboard, nhân sự, role động, phân quyền
    ├── report              # Tố cáo nội dung
    ├── mail                # Gửi email OTP
    └── file                # Lưu file upload
```

## Quy ước trong mỗi module

```text
modules/<module-name>
├── controller
├── dto
│   ├── request
│   └── response
├── entity / document
├── mapper
├── repository
└── service
    └── impl
```

## Ghi chú

- Logic nghiệp vụ fanpage được giữ nguyên, chỉ thay đổi vị trí package để code dễ quản lý hơn.
- Các class dùng chung vẫn đặt ở `common`, `config`, `exception`, `security`, `util`.
- Chat dùng MongoDB nên module `chat` có thêm `document` và `repository/mongo`.
- File upload runtime không đóng gói dữ liệu ảnh/video cũ, chỉ giữ thư mục rỗng bằng `.gitkeep`.
```
