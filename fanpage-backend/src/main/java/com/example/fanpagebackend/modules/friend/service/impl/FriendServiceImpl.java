package com.example.fanpagebackend.modules.friend.service.impl;

import com.example.fanpagebackend.common.FriendshipStatus;
import com.example.fanpagebackend.modules.friend.dto.response.FriendRequestResponse;
import com.example.fanpagebackend.modules.user.dto.response.UserSummaryResponse;
import com.example.fanpagebackend.modules.friend.entity.FriendRequest;
import com.example.fanpagebackend.modules.user.entity.User;
import com.example.fanpagebackend.exception.BadRequestException;
import com.example.fanpagebackend.exception.ForbiddenException;
import com.example.fanpagebackend.exception.NotFoundException;
import com.example.fanpagebackend.modules.friend.repository.FriendRequestRepository;
import com.example.fanpagebackend.modules.chat.service.ChatPresenceService;
import com.example.fanpagebackend.modules.friend.service.FriendService;
import com.example.fanpagebackend.modules.user.service.UserService;
import com.example.fanpagebackend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FriendServiceImpl implements FriendService {

    private final FriendRequestRepository friendRequestRepository;
    private final UserService userService;
    private final SecurityUtil securityUtil;
    private final ChatPresenceService chatPresenceService;

    @Override
    @Transactional
    public FriendRequestResponse sendRequest(Long userId) {
        User currentUser = securityUtil.getCurrentUser();
        User target = userService.getUserEntityById(userId);

        if (currentUser.getId().equals(target.getId())) {
            throw new BadRequestException("Bạn không thể gửi lời mời kết bạn cho chính mình");
        }

        FriendRequest existing = friendRequestRepository.findBetween(currentUser, target).orElse(null);
        if (existing != null) {
            if (existing.getStatus() == FriendshipStatus.ACCEPTED) {
                throw new BadRequestException("Hai người đã là bạn bè");
            }
            if (existing.getStatus() == FriendshipStatus.PENDING) {
                throw new BadRequestException("Lời mời kết bạn đang chờ xử lý");
            }
            existing.setRequester(currentUser);
            existing.setAddressee(target);
            existing.setStatus(FriendshipStatus.PENDING);
            return toResponse(friendRequestRepository.save(existing));
        }

        FriendRequest request = FriendRequest.builder()
                .requester(currentUser)
                .addressee(target)
                .status(FriendshipStatus.PENDING)
                .build();

        return toResponse(friendRequestRepository.save(request));
    }

    @Override
    @Transactional
    public FriendRequestResponse acceptRequest(Long requestId) {
        User currentUser = securityUtil.getCurrentUser();
        FriendRequest request = getRequest(requestId);

        if (!request.getAddressee().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Bạn không có quyền chấp nhận lời mời này");
        }

        request.setStatus(FriendshipStatus.ACCEPTED);
        return toResponse(friendRequestRepository.save(request));
    }

    @Override
    @Transactional
    public void rejectRequest(Long requestId) {
        User currentUser = securityUtil.getCurrentUser();
        FriendRequest request = getRequest(requestId);

        if (!request.getAddressee().getId().equals(currentUser.getId())
                && !request.getRequester().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Bạn không có quyền xử lý lời mời này");
        }

        request.setStatus(FriendshipStatus.REJECTED);
        friendRequestRepository.save(request);
    }

    @Override
    @Transactional
    public void removeFriend(Long userId) {
        User currentUser = securityUtil.getCurrentUser();
        User target = userService.getUserEntityById(userId);
        FriendRequest request = friendRequestRepository.findBetween(currentUser, target)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy quan hệ bạn bè"));
        friendRequestRepository.delete(request);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserSummaryResponse> getFriends() {
        User currentUser = securityUtil.getCurrentUser();
        return friendRequestRepository.findAcceptedByUser(currentUser, FriendshipStatus.ACCEPTED)
                .stream()
                .map(item -> item.getRequester().getId().equals(currentUser.getId()) ? item.getAddressee() : item.getRequester())
                .map(user -> toUserSummary(user, "FRIEND"))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FriendRequestResponse> getReceivedRequests() {
        User currentUser = securityUtil.getCurrentUser();
        return friendRequestRepository.findByAddresseeAndStatusOrderByCreatedAtDesc(currentUser, FriendshipStatus.PENDING)
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FriendRequestResponse> getSentRequests() {
        User currentUser = securityUtil.getCurrentUser();
        return friendRequestRepository.findByRequesterAndStatusOrderByCreatedAtDesc(currentUser, FriendshipStatus.PENDING)
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public String getFriendshipStatus(Long otherUserId) {
        User currentUser = securityUtil.getCurrentUser();
        User other = userService.getUserEntityById(otherUserId);
        if (currentUser.getId().equals(other.getId())) {
            return "SELF";
        }
        return friendRequestRepository.findBetween(currentUser, other)
                .map(request -> {
                    if (request.getStatus() == FriendshipStatus.ACCEPTED) return "FRIEND";
                    if (request.getStatus() == FriendshipStatus.PENDING
                            && request.getRequester().getId().equals(currentUser.getId())) return "PENDING_SENT";
                    if (request.getStatus() == FriendshipStatus.PENDING
                            && request.getAddressee().getId().equals(currentUser.getId())) return "PENDING_RECEIVED";
                    return request.getStatus().name();
                })
                .orElse("NONE");
    }

    private FriendRequest getRequest(Long id) {
        return friendRequestRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lời mời kết bạn"));
    }

    private FriendRequestResponse toResponse(FriendRequest request) {
        return FriendRequestResponse.builder()
                .id(request.getId())
                .status(request.getStatus().name())
                .requester(toUserSummary(request.getRequester(), null))
                .addressee(toUserSummary(request.getAddressee(), null))
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .build();
    }

    private UserSummaryResponse toUserSummary(User user, String status) {
        return UserSummaryResponse.builder()
                .id(user.getId())
                .name(user.getFullName())
                .username(user.getUsername())
                .avatar(user.getAvatar())
                .bio(user.getBio())
                .friendshipStatus(status)
                .online(chatPresenceService.isOnline(user.getId()))
                .build();
    }
}
