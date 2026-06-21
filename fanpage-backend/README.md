# Fanpage Backend

Backend Spring Boot cho dự án fanpage mini.

## Công nghệ
- Java 17
- Spring Boot 3
- Spring Web
- Spring Data JPA
- Spring Security
- JWT
- OAuth2 Login với Google
- Validation
- MySQL
- Lombok

## Cấu hình Google Login
Tạo OAuth Client trên Google Cloud và thêm redirect URI:

```text
http://localhost:8080/login/oauth2/code/google
```

Khai báo biến môi trường hoặc sửa trong `application.yml`:

```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:5173
OAUTH2_AUTHORIZED_REDIRECT_URI=http://localhost:5173/auth/oauth2/callback
```

## Chạy nhanh
1. Tạo database `fanpage_db`
2. Sửa username/password MySQL trong `src/main/resources/application.yml` nếu cần
3. Cấu hình `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET`
4. Chạy backend

```bash
mvn spring-boot:run
```

## Tài khoản mẫu
- `nguyenvana / 123456`
- `tranthibinh / 123456`
- `phamquanghuy / 123456`

## Luồng Google Login
- Frontend gọi `http://localhost:8080/oauth2/authorization/google`
- Google xác thực xong sẽ trả về backend
- Backend tạo JWT riêng của hệ thống
- Backend redirect về frontend `auth/oauth2/callback?token=...`
- Frontend lưu token rồi gọi `/api/auth/me`
