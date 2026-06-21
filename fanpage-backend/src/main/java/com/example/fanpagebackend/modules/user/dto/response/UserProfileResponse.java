package com.example.fanpagebackend.modules.user.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@Builder
public class UserProfileResponse {

    private Long id;
    private String name;
    private String username;
    private String email;
    private String avatar;
    private String bio;
    private String location;
    private String gender;
    private LocalDateTime joinedAt;
    private String role;
    private Long staffRoleId;
    private String staffRoleName;
    private Set<String> permissions;
    private String provider;
    private boolean emailVerified;
    private boolean locked;
    private LocalDateTime lockedUntil;
    private String lockReason;
    private String accountDeletionRequestStatus;
}
