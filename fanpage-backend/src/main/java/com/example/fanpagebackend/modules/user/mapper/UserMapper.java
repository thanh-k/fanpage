package com.example.fanpagebackend.modules.user.mapper;

import com.example.fanpagebackend.modules.user.dto.response.PublicUserProfileResponse;
import com.example.fanpagebackend.modules.user.dto.response.UserProfileResponse;
import com.example.fanpagebackend.modules.admin.entity.StaffRole;
import com.example.fanpagebackend.modules.user.entity.User;
import com.example.fanpagebackend.util.MaskUtil;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class UserMapper {

    public UserProfileResponse toMyProfile(User user) {
        StaffRole staffRole = user.getStaffRole();
        Set<String> permissions = user.getRole().name().equals("SUPER_ADMIN")
                ? Set.of("SUPER_ADMIN")
                : staffRole == null ? Set.of() : staffRole.getPermissions().stream().map(Enum::name).collect(Collectors.toSet());

        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getFullName())
                .username(user.getUsername())
                .email(user.getEmail())
                .avatar(user.getAvatar())
                .bio(user.getBio())
                .location(user.getLocation())
                .gender(user.getGender() == null ? "PRIVATE" : user.getGender().name())
                .joinedAt(user.getJoinedAt())
                .role(user.getRole().name())
                .staffRoleId(staffRole == null ? null : staffRole.getId())
                .staffRoleName(staffRole == null ? null : staffRole.getName())
                .permissions(permissions)
                .provider(user.getProvider())
                .emailVerified(user.isEmailVerified())
                .locked(user.isLocked() && user.getLockedUntil() != null && user.getLockedUntil().isAfter(java.time.LocalDateTime.now()))
                .lockedUntil(user.getLockedUntil())
                .lockReason(user.getLockReason())
                .accountDeletionRequestStatus(null)
                .build();
    }

    public PublicUserProfileResponse toPublicProfile(User user, long publicPostsCount) {
        return toPublicProfile(user, publicPostsCount, "NONE");
    }

    public PublicUserProfileResponse toPublicProfile(User user, long publicPostsCount, String friendshipStatus) {
        return PublicUserProfileResponse.builder()
                .id(user.getId())
                .name(user.getFullName())
                .username(user.getUsername())
                .avatar(user.getAvatar())
                .bio(user.getBio())
                .location(user.getLocation())
                .gender(user.getGender() == null ? "PRIVATE" : user.getGender().name())
                .joinedAt(user.getJoinedAt())
                .publicPostsCount(publicPostsCount)
                .emailMasked(MaskUtil.maskEmail(user.getEmail()))
                .friendshipStatus(friendshipStatus)
                .build();
    }
}
