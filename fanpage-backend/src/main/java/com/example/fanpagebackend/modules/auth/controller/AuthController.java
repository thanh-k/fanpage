package com.example.fanpagebackend.modules.auth.controller;

import com.example.fanpagebackend.common.ApiResponse;
import com.example.fanpagebackend.modules.auth.dto.request.ConfirmPasswordResetRequest;
import com.example.fanpagebackend.modules.auth.dto.request.LoginRequest;
import com.example.fanpagebackend.modules.auth.dto.request.RequestPasswordResetOtpRequest;
import com.example.fanpagebackend.modules.auth.dto.request.RequestRegisterOtpRequest;
import com.example.fanpagebackend.modules.auth.dto.request.VerifyRegisterOtpRequest;
import com.example.fanpagebackend.modules.auth.dto.response.AuthResponse;
import com.example.fanpagebackend.common.dto.response.MessageResponse;
import com.example.fanpagebackend.modules.user.dto.response.UserProfileResponse;
import com.example.fanpagebackend.modules.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret:}")
    private String googleClientSecret;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @PostMapping("/register/request")
    public ApiResponse<MessageResponse> requestRegisterOtp(@Valid @RequestBody RequestRegisterOtpRequest request) {
        return ApiResponse.success("Gửi mã xác thực đăng ký thành công", authService.requestRegisterOtp(request));
    }

    @PostMapping("/register/verify")
    public ApiResponse<AuthResponse> verifyRegisterOtp(@Valid @RequestBody VerifyRegisterOtpRequest request) {
        return ApiResponse.success("Xác thực đăng ký thành công", authService.verifyRegisterOtp(request));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success("Đăng nhập thành công", authService.login(request));
    }

    @PostMapping("/password-reset/request")
    public ApiResponse<MessageResponse> requestPasswordResetOtp(@Valid @RequestBody RequestPasswordResetOtpRequest request) {
        return ApiResponse.success("Gửi mã đặt lại mật khẩu thành công", authService.requestPasswordResetOtp(request));
    }

    @PostMapping("/password-reset/confirm")
    public ApiResponse<MessageResponse> confirmPasswordReset(@Valid @RequestBody ConfirmPasswordResetRequest request) {
        return ApiResponse.success("Đặt lại mật khẩu thành công", authService.confirmPasswordReset(request));
    }

    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> me() {
        return ApiResponse.success("Lấy thông tin người dùng hiện tại thành công", authService.getCurrentUserProfile());
    }

    @GetMapping("/providers")
    public ApiResponse<Map<String, Object>> providers() {
        boolean googleConfigured =
                StringUtils.hasText(googleClientId) &&
                StringUtils.hasText(googleClientSecret);

        boolean smtpConfigured =
                StringUtils.hasText(mailUsername) &&
                StringUtils.hasText(mailPassword);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("googleConfigured", googleConfigured);
        data.put("smtpConfigured", smtpConfigured);
        data.put("googleLoginUrl", googleConfigured ? "/oauth2/authorization/google" : null);

        return ApiResponse.success("Lấy cấu hình đăng nhập thành công", data);
    }
}
