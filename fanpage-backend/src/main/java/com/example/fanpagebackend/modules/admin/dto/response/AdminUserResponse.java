package com.example.fanpagebackend.modules.admin.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Builder
public class AdminUserResponse {
    private Long id;
    private String name;
    private String username;
    private String email;
    private String avatar;
    private String gender;
    private String role;
    private Long staffRoleId;
    private String staffRoleName;
    private Set<String> permissions;
    private String provider;
    private boolean emailVerified;
    private boolean locked;
    private LocalDateTime lockedUntil;
    private String lockReason;
    private LocalDateTime joinedAt;
    private long postCount;
    private long publicPostCount;
}
