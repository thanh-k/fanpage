package com.example.fanpagebackend.security;

import com.example.fanpagebackend.modules.user.entity.User;
import com.example.fanpagebackend.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private static final String OAUTH2_DUMMY_PASSWORD = "{noop}oauth2-user";

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy user với username: " + username));

        if (user.isLocked() && user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {
            throw new UsernameNotFoundException("Tài khoản đang bị khóa đến " + user.getLockedUntil());
        }

        String password = user.getPassword();
        if (password == null || password.isBlank()) {
            password = OAUTH2_DUMMY_PASSWORD;
        }

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                password,
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
