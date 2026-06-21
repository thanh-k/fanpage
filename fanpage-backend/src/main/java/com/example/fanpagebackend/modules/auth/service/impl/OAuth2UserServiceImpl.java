package com.example.fanpagebackend.modules.auth.service.impl;

import com.example.fanpagebackend.common.Role;
import com.example.fanpagebackend.common.Gender;
import com.example.fanpagebackend.modules.user.entity.User;
import com.example.fanpagebackend.exception.BadRequestException;
import com.example.fanpagebackend.modules.user.repository.UserRepository;
import com.example.fanpagebackend.modules.auth.service.OAuth2UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OAuth2UserServiceImpl implements OAuth2UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public User processGoogleUser(OAuth2User oAuth2User) {
        String provider = "GOOGLE";
        String providerId = getRequiredAttribute(oAuth2User, "sub");
        String email = getRequiredAttribute(oAuth2User, "email").trim().toLowerCase(Locale.ROOT);
        String fullName = getOptionalAttribute(oAuth2User, "name", email);
        String picture = getOptionalAttribute(oAuth2User, "picture", null);

        return userRepository.findByProviderAndProviderId(provider, providerId)
                .map(existingUser -> updateExistingGoogleUser(existingUser, fullName, picture))
                .orElseGet(() -> createOrLinkGoogleUser(provider, providerId, email, fullName, picture));
    }

    private User updateExistingGoogleUser(User user, String fullName, String picture) {
        user.setFullName(fullName);
        if (user.getAvatar() == null || user.getAvatar().isBlank()) {
            user.setAvatar(hasText(picture) ? picture : com.example.fanpagebackend.util.AvatarUtil.createInitialAvatar(fullName));
        }
        user.setProvider("GOOGLE");
        user.setEmailVerified(true);
        return userRepository.save(user);
    }

    private User createOrLinkGoogleUser(String provider, String providerId, String email, String fullName, String picture) {
        return userRepository.findByEmail(email)
                .map(user -> linkLocalAccountIfPossible(user, provider, providerId, fullName, picture))
                .orElseGet(() -> createGoogleUser(provider, providerId, email, fullName, picture));
    }

    private User linkLocalAccountIfPossible(User user, String provider, String providerId, String fullName, String picture) {
        if (!"LOCAL".equalsIgnoreCase(user.getProvider())) {
            throw new BadRequestException("Email này đã được liên kết với phương thức đăng nhập khác.");
        }

        user.setProvider(provider);
        user.setProviderId(providerId);
        user.setFullName(fullName);
        user.setEmailVerified(true);

        if (user.getAvatar() == null || user.getAvatar().isBlank()) {
            user.setAvatar(hasText(picture) ? picture : com.example.fanpagebackend.util.AvatarUtil.createInitialAvatar(fullName));
        }

        return userRepository.save(user);
    }

    private User createGoogleUser(String provider, String providerId, String email, String fullName, String picture) {
        String username = generateUniqueUsername(email, fullName);

        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .fullName(fullName)
                .email(email)
                .avatar(hasText(picture) ? picture : com.example.fanpagebackend.util.AvatarUtil.createInitialAvatar(fullName))
                .bio("Thành viên mới đăng nhập bằng Google.")
                .location("TP.HCM")
                .gender(Gender.PRIVATE)
                .role(Role.USER)
                .provider(provider)
                .providerId(providerId)
                .emailVerified(true)
                .joinedAt(LocalDateTime.now())
                .build();

        return userRepository.save(user);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String generateUniqueUsername(String email, String fullName) {
        String base = (fullName != null && !fullName.isBlank() ? fullName : email)
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "")
                .replaceAll("^_+|_+$", "");

        if (base.isBlank()) {
            base = "googleuser";
        }

        if (base.length() > 20) {
            base = base.substring(0, 20);
        }

        String candidate = base;
        int counter = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = base;
            String suffix = String.valueOf(counter++);
            if (candidate.length() + suffix.length() > 50) {
                candidate = candidate.substring(0, 50 - suffix.length());
            }
            candidate = candidate + suffix;
        }
        return candidate;
    }

    private String getRequiredAttribute(OAuth2User oAuth2User, String key) {
        Object value = oAuth2User.getAttributes().get(key);
        if (value == null || value.toString().isBlank()) {
            throw new BadRequestException("Google không trả về trường bắt buộc: " + key);
        }
        return value.toString();
    }

    private String getOptionalAttribute(OAuth2User oAuth2User, String key, String defaultValue) {
        Object value = oAuth2User.getAttributes().get(key);
        return value == null || value.toString().isBlank() ? defaultValue : value.toString();
    }
}
