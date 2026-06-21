package com.example.fanpagebackend.util;

import com.example.fanpagebackend.modules.user.entity.User;
import com.example.fanpagebackend.exception.UnauthorizedException;
import com.example.fanpagebackend.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityUtil {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("Bạn chưa đăng nhập");
        }

        String principal = authentication.getName();
        return userRepository.findByUsername(principal)
                .or(() -> userRepository.findByEmail(principal))
                .orElseThrow(() -> new UnauthorizedException("Không tìm thấy người dùng đăng nhập: " + principal));
    }
}
