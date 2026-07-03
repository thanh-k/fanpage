# Fanpage Frontend API Version

Frontend React + Tailwind đã tích hợp đầy đủ các luồng auth của backend Spring Boot:

- đăng nhập thường
- đăng ký bằng OTP email
- quên mật khẩu bằng OTP email
- đăng nhập Google

## Cài đặt
```bash
npm install
```

## Cấu hình
Tạo file `.env`:
```bash
VITE_API_BASE_URL=http://localhost:8080/api
VITE_SERVER_BASE_URL=http://localhost:8080
```

## Chạy
```bash
npm run dev
```

## Lưu ý
- Nút `Đăng nhập bằng Google` sẽ tự ẩn nếu backend chưa cấu hình `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET`.
- Trang `Đăng ký` và `Quên mật khẩu` sẽ cảnh báo nếu backend chưa cấu hình Gmail SMTP.
- Callback Google dùng route: `/auth/oauth2/callback`.
