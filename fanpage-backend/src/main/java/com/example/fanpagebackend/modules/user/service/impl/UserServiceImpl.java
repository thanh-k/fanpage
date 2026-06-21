package com.example.fanpagebackend.modules.user.service.impl;

import com.example.fanpagebackend.common.Gender;
import com.example.fanpagebackend.common.AccountDeletionRequestStatus;
import com.example.fanpagebackend.common.dto.response.MessageResponse;
import com.example.fanpagebackend.modules.accountdeletion.entity.AccountDeletionRequest;
import com.example.fanpagebackend.modules.accountdeletion.repository.AccountDeletionRequestRepository;
import com.example.fanpagebackend.modules.user.dto.request.UpdateMyProfileRequest;
import com.example.fanpagebackend.modules.user.dto.response.PublicUserProfileResponse;
import com.example.fanpagebackend.modules.user.dto.response.UserProfileResponse;
import com.example.fanpagebackend.modules.user.dto.response.UserSummaryResponse;
import com.example.fanpagebackend.modules.user.entity.User;
import com.example.fanpagebackend.exception.BadRequestException;
import com.example.fanpagebackend.exception.NotFoundException;
import com.example.fanpagebackend.modules.user.mapper.UserMapper;
import com.example.fanpagebackend.modules.friend.repository.FriendRequestRepository;
import com.example.fanpagebackend.modules.post.repository.PostRepository;
import com.example.fanpagebackend.modules.user.repository.UserRepository;
import com.example.fanpagebackend.modules.file.service.FileStorageService;
import com.example.fanpagebackend.modules.user.service.UserService;
import com.example.fanpagebackend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final UserMapper userMapper;
    private final SecurityUtil securityUtil;
    private final FileStorageService fileStorageService;
    private final FriendRequestRepository friendRequestRepository;
    private final AccountDeletionRequestRepository accountDeletionRequestRepository;

    @Override
    public UserProfileResponse getMyProfile() {
        User currentUser = securityUtil.getCurrentUser();
        UserProfileResponse response = userMapper.toMyProfile(currentUser);
        accountDeletionRequestRepository.findFirstByUserOrderByCreatedAtDesc(currentUser)
                .ifPresent(request -> response.setAccountDeletionRequestStatus(request.getStatus().name()));
        return response;
    }

    @Override
    public PublicUserProfileResponse getPublicProfile(Long userId) {
        User user = getUserEntityById(userId);
        long publicPostsCount = postRepository.countByAuthorAndAnonymousFalse(user);
        User currentUser = securityUtil.getCurrentUser();
        String friendshipStatus = currentUser.getId().equals(user.getId()) ? "SELF" : resolveFriendshipStatus(currentUser, user);
        return userMapper.toPublicProfile(user, publicPostsCount, friendshipStatus);
    }

    @Override
    @Transactional
    public UserProfileResponse updateMyProfile(UpdateMyProfileRequest request) {
        User currentUser = securityUtil.getCurrentUser();

        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if ("GOOGLE".equalsIgnoreCase(currentUser.getProvider())
                && !currentUser.getEmail().equalsIgnoreCase(normalizedEmail)) {
            throw new BadRequestException("Tài khoản Google không thể đổi email thủ công");
        }

        if (!currentUser.getEmail().equalsIgnoreCase(normalizedEmail)
                && userRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("Email đã tồn tại");
        }

        validateAvatarFile(request.getAvatarFile());

        currentUser.setFullName(request.getName().trim());
        currentUser.setEmail(normalizedEmail);
        currentUser.setBio(toNullableValue(request.getBio()));
        currentUser.setLocation(toNullableValue(request.getLocation()));
        currentUser.setGender(request.getGender() == null ? Gender.PRIVATE : request.getGender());

        String avatarUrl = fileStorageService.storeAvatar(request.getAvatarFile(), currentUser.getAvatar());
        currentUser.setAvatar(avatarUrl);

        User savedUser = userRepository.save(currentUser);
        return userMapper.toMyProfile(savedUser);
    }

    @Override
    public User getUserEntityById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng"));
    }


    @Override
    @Transactional(readOnly = true)
    public List<UserSummaryResponse> searchUsers(String keyword) {
        User currentUser = securityUtil.getCurrentUser();
        String normalizedKeyword = keyword == null ? "" : keyword.trim();
        if (normalizedKeyword.length() < 1) {
            return List.of();
        }

        return userRepository.searchUsers(normalizedKeyword, currentUser.getId())
                .stream()
                .limit(30)
                .map(user -> UserSummaryResponse.builder()
                        .id(user.getId())
                        .name(user.getFullName())
                        .username(user.getUsername())
                        .avatar(user.getAvatar())
                        .bio(user.getBio())
                        .gender(user.getGender() == null ? Gender.PRIVATE.name() : user.getGender().name())
                        .friendshipStatus(resolveFriendshipStatus(currentUser, user))
                        .build())
                .toList();
    }

    @Override
    @Transactional
    public MessageResponse requestAccountDeletion(String reason) {
        User currentUser = securityUtil.getCurrentUser();
        if (currentUser.getRole() != com.example.fanpagebackend.common.Role.USER) {
            throw new BadRequestException("Chỉ tài khoản người dùng thường mới được gửi yêu cầu hủy tài khoản");
        }
        if (accountDeletionRequestRepository.existsByUserAndStatus(currentUser, AccountDeletionRequestStatus.PENDING)) {
            throw new BadRequestException("Bạn đã có một yêu cầu hủy tài khoản đang chờ duyệt");
        }
        AccountDeletionRequest request = AccountDeletionRequest.builder()
                .user(currentUser)
                .reason(toNullableValue(reason))
                .status(AccountDeletionRequestStatus.PENDING)
                .build();
        accountDeletionRequestRepository.save(request);
        return MessageResponse.builder().value("Yêu cầu hủy tài khoản đã được gửi đến quản trị viên.").build();
    }

    private String resolveFriendshipStatus(User currentUser, User other) {
        return friendRequestRepository.findBetween(currentUser, other)
                .map(request -> {
                    if (request.getStatus().name().equals("ACCEPTED")) {
                        return "FRIEND";
                    }
                    if (request.getRequester().getId().equals(currentUser.getId())) {
                        return "PENDING_SENT";
                    }
                    return "PENDING_RECEIVED";
                })
                .orElse("NONE");
    }

    private String toNullableValue(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private void validateAvatarFile(org.springframework.web.multipart.MultipartFile avatarFile) {
        if (avatarFile == null || avatarFile.isEmpty()) {
            return;
        }

        if (avatarFile.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("Ảnh đại diện không được lớn hơn 5MB");
        }

        String contentType = avatarFile.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("File avatar phải là ảnh hợp lệ");
        }
    }
}
