package com.example.fanpagebackend.modules.auth.service.impl;

import com.example.fanpagebackend.common.Role;
import com.example.fanpagebackend.common.Gender;
import com.example.fanpagebackend.common.VerificationPurpose;
import com.example.fanpagebackend.modules.auth.dto.request.*;
import com.example.fanpagebackend.modules.user.dto.request.*;
import com.example.fanpagebackend.modules.post.dto.request.*;
import com.example.fanpagebackend.modules.comment.dto.request.*;
import com.example.fanpagebackend.modules.chat.dto.request.*;
import com.example.fanpagebackend.modules.admin.dto.request.*;
import com.example.fanpagebackend.modules.report.dto.request.*;
import com.example.fanpagebackend.modules.auth.dto.response.AuthResponse;
import com.example.fanpagebackend.common.dto.response.MessageResponse;
import com.example.fanpagebackend.modules.user.dto.response.UserProfileResponse;
import com.example.fanpagebackend.modules.auth.entity.EmailVerification;
import com.example.fanpagebackend.modules.user.entity.User;
import com.example.fanpagebackend.exception.BadRequestException;
import com.example.fanpagebackend.exception.UnauthorizedException;
import com.example.fanpagebackend.modules.user.mapper.UserMapper;
import com.example.fanpagebackend.modules.auth.repository.EmailVerificationRepository;
import com.example.fanpagebackend.modules.user.repository.UserRepository;
import com.example.fanpagebackend.security.JwtService;
import com.example.fanpagebackend.modules.auth.service.AuthService;
import com.example.fanpagebackend.modules.mail.service.EmailService;
import com.example.fanpagebackend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import com.example.fanpagebackend.modules.auth.dto.request.ConfirmPasswordResetRequest;
import com.example.fanpagebackend.modules.auth.dto.request.LoginRequest;
import com.example.fanpagebackend.modules.auth.dto.request.RequestPasswordResetOtpRequest;
import com.example.fanpagebackend.modules.auth.dto.request.RequestRegisterOtpRequest;
import com.example.fanpagebackend.modules.auth.dto.request.VerifyRegisterOtpRequest;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserMapper userMapper;
    private final SecurityUtil securityUtil;
    private final EmailService emailService;

    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.otp.expiration-minutes:10}")
    private long otpExpirationMinutes;

    @Override
    @Transactional
    public MessageResponse requestRegisterOtp(RequestRegisterOtpRequest request) {
        validateRegisterRequest(request);

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        emailVerificationRepository.deleteByExpiresAtBefore(LocalDateTime.now());
        deactivateOldCodes(normalizedEmail, VerificationPurpose.REGISTER);

        String code = generateOtpCode();

        EmailVerification verification = EmailVerification.builder()
                .email(normalizedEmail)
                .code(code)
                .purpose(VerificationPurpose.REGISTER)
                .expiresAt(LocalDateTime.now().plusMinutes(otpExpirationMinutes))
                .pendingUsername(request.getUsername().trim())
                .pendingPasswordHash(passwordEncoder.encode(request.getPassword()))
                .pendingFullName(request.getName().trim())
                .pendingGender(normalizeGender(request.getGender()))
                .build();

        emailVerificationRepository.save(verification);
        emailService.sendOtpEmail(normalizedEmail, request.getName().trim(), code, "Mã xác thực đăng ký tài khoản", "xác thực đăng ký tài khoản");

        return MessageResponse.builder()
                .value("Mã xác thực đã được gửi tới email của bạn")
                .build();
    }

    @Override
    @Transactional
    public AuthResponse verifyRegisterOtp(VerifyRegisterOtpRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        EmailVerification verification = getValidVerification(normalizedEmail, request.getCode(), VerificationPurpose.REGISTER);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("Email đã tồn tại");
        }

        if (userRepository.existsByUsername(verification.getPendingUsername())) {
            throw new BadRequestException("Username đã tồn tại");
        }

        User user = User.builder()
                .username(verification.getPendingUsername())
                .password(verification.getPendingPasswordHash())
                .fullName(verification.getPendingFullName())
                .email(normalizedEmail)
                .avatar(null)
                .bio("Thành viên mới của fanpage mini.")
                .location("TP.HCM")
                .gender(verification.getPendingGender() == null ? Gender.PRIVATE : verification.getPendingGender())
                .role(Role.USER)
                .provider("LOCAL")
                .emailVerified(true)
                .joinedAt(LocalDateTime.now())
                .build();

        userRepository.save(user);
        verification.setUsedAt(LocalDateTime.now());
        emailVerificationRepository.save(verification);

        return buildAuthResponse(user);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
        } catch (Exception ex) {
            throw new UnauthorizedException("Tên đăng nhập hoặc mật khẩu không đúng");
        }

        User user = userRepository.findByUsername(request.getUsername().trim())
                .orElseThrow(() -> new UnauthorizedException("Tên đăng nhập hoặc mật khẩu không đúng"));

        if (!"LOCAL".equalsIgnoreCase(user.getProvider())) {
            throw new UnauthorizedException("Tài khoản này được tạo bằng Google. Hãy đăng nhập bằng Google.");
        }

        if (!user.isEmailVerified()) {
            throw new UnauthorizedException("Tài khoản này chưa xác thực email.");
        }

        if (user.isLocked() && user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {
            throw new UnauthorizedException("Tài khoản của bạn đang bị khóa đến " + user.getLockedUntil());
        }

        return buildAuthResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile() {
        User currentUser = securityUtil.getCurrentUser();
        return userMapper.toMyProfile(currentUser);
    }

    @Override
    @Transactional
    public MessageResponse requestPasswordResetOtp(RequestPasswordResetOtpRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy tài khoản với email này"));

        if (!"LOCAL".equalsIgnoreCase(user.getProvider())) {
            throw new BadRequestException("Tài khoản này đăng nhập bằng Google, không dùng đặt lại mật khẩu.");
        }

        emailVerificationRepository.deleteByExpiresAtBefore(LocalDateTime.now());
        deactivateOldCodes(normalizedEmail, VerificationPurpose.RESET_PASSWORD);

        String code = generateOtpCode();

        EmailVerification verification = EmailVerification.builder()
                .email(normalizedEmail)
                .code(code)
                .purpose(VerificationPurpose.RESET_PASSWORD)
                .expiresAt(LocalDateTime.now().plusMinutes(otpExpirationMinutes))
                .build();

        emailVerificationRepository.save(verification);
        emailService.sendOtpEmail(normalizedEmail, user.getFullName(), code, "Mã xác thực đặt lại mật khẩu", "đặt lại mật khẩu");

        return MessageResponse.builder()
                .value("Mã đặt lại mật khẩu đã được gửi tới email của bạn")
                .build();
    }

    @Override
    @Transactional
    public MessageResponse confirmPasswordReset(ConfirmPasswordResetRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Xác nhận mật khẩu không khớp");
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        EmailVerification verification = getValidVerification(normalizedEmail, request.getCode(), VerificationPurpose.RESET_PASSWORD);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy tài khoản với email này"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        verification.setUsedAt(LocalDateTime.now());

        userRepository.save(user);
        emailVerificationRepository.save(verification);

        return MessageResponse.builder()
                .value("Đặt lại mật khẩu thành công")
                .build();
    }

    private Gender normalizeGender(Gender gender) {
        return gender == null ? Gender.PRIVATE : gender;
    }

    private AuthResponse buildAuthResponse(User user) {
        String password = user.getPassword();
        if (password == null || password.isBlank()) {
            password = "{noop}oauth2-user";
        }

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                password,
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );

        String token = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .user(userMapper.toMyProfile(user))
                .build();
    }

    private void validateRegisterRequest(RequestRegisterOtpRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Xác nhận mật khẩu không khớp");
        }

        String username = request.getUsername().trim();
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByUsername(username)) {
            throw new BadRequestException("Username đã tồn tại");
        }

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email đã tồn tại");
        }
    }

    private EmailVerification getValidVerification(String email, String code, VerificationPurpose purpose) {
        EmailVerification verification = emailVerificationRepository
                .findTopByEmailAndPurposeAndUsedAtIsNullOrderByCreatedAtDesc(email, purpose)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy mã xác thực hợp lệ"));

        if (!verification.getCode().equals(code)) {
            throw new BadRequestException("Mã xác thực không đúng");
        }

        if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Mã xác thực đã hết hạn");
        }

        return verification;
    }

    private void deactivateOldCodes(String email, VerificationPurpose purpose) {
        List<EmailVerification> verifications = emailVerificationRepository.findByEmailAndPurposeAndUsedAtIsNull(email, purpose);

        for (EmailVerification verification : verifications) {
            verification.setUsedAt(LocalDateTime.now());
        }

        emailVerificationRepository.saveAll(verifications);
    }

    private String generateOtpCode() {
        int value = secureRandom.nextInt(900000) + 100000;
        return String.valueOf(value);
    }
}
