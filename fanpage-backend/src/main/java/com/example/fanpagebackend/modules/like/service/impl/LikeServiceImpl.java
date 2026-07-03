package com.example.fanpagebackend.modules.like.service.impl;

import com.example.fanpagebackend.modules.like.dto.response.LikeToggleResponse;
import com.example.fanpagebackend.modules.like.dto.response.ReactionUserResponse;
import com.example.fanpagebackend.modules.like.entity.PostLike;
import com.example.fanpagebackend.modules.like.entity.ReactionType;
import com.example.fanpagebackend.modules.like.repository.PostLikeRepository;
import com.example.fanpagebackend.modules.like.service.LikeService;
import com.example.fanpagebackend.modules.notification.constant.NotificationType;
import com.example.fanpagebackend.modules.notification.service.NotificationService;
import com.example.fanpagebackend.modules.post.entity.Post;
import com.example.fanpagebackend.modules.post.service.impl.PostServiceImpl;
import com.example.fanpagebackend.modules.user.entity.User;
import com.example.fanpagebackend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class LikeServiceImpl implements LikeService {

    private final PostLikeRepository postLikeRepository;
    private final PostServiceImpl postService;
    private final SecurityUtil securityUtil;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public LikeToggleResponse toggleLike(Long postId) {
        return reactToPost(postId, ReactionType.LIKE.name());
    }

    @Override
    @Transactional
    public LikeToggleResponse reactToPost(Long postId, String reactionTypeValue) {
        User currentUser = securityUtil.getCurrentUser();
        Post post = postService.getPostEntity(postId);
        ReactionType requestedType = parseReactionType(reactionTypeValue);

        List<PostLike> existingReactions = new ArrayList<>(postLikeRepository.findAllByPostAndUser(post, currentUser));
        cleanupDuplicateReactions(existingReactions);

        PostLike savedReaction = null;

        if (!existingReactions.isEmpty()) {
            PostLike existingReaction = existingReactions.get(0);
            ReactionType currentType = existingReaction.getReactionType() != null
                    ? existingReaction.getReactionType()
                    : ReactionType.LIKE;

            if (currentType == requestedType) {
                postLikeRepository.delete(existingReaction);
                postLikeRepository.flush();
            } else {
                existingReaction.setReactionType(requestedType);
                savedReaction = postLikeRepository.saveAndFlush(existingReaction);
            }
        } else {
            savedReaction = createReactionSafely(post, currentUser, requestedType);
        }

        boolean reacted = savedReaction != null;
        long totalReactions = postLikeRepository.countByPost(post);

        if (reacted && post.getAuthor() != null && !post.getAuthor().getId().equals(currentUser.getId())) {
            sendReactionNotificationSafely(post, currentUser, requestedType);
        }

        return LikeToggleResponse.builder()
                .postId(postId)
                .liked(reacted)
                .likesCount(totalReactions)
                .reactionType(reacted ? savedReaction.getReactionType().name() : null)
                .reactionCounts(buildReactionCounts(post))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReactionUserResponse> getReactionUsers(Long postId) {
        Post post = postService.getPostEntity(postId);
        return postLikeRepository.findByPost(post).stream()
                .map(item -> ReactionUserResponse.builder()
                        .userId(item.getUser().getId())
                        .name(item.getUser().getFullName())
                        .username(item.getUser().getUsername())
                        .avatar(item.getUser().getAvatar())
                        .reactionType(item.getReactionType() != null ? item.getReactionType().name() : ReactionType.LIKE.name())
                        .reactedAt(item.getCreatedAt())
                        .build())
                .toList();
    }

    private PostLike createReactionSafely(Post post, User currentUser, ReactionType reactionType) {
        try {
            return postLikeRepository.saveAndFlush(
                    PostLike.builder()
                            .post(post)
                            .user(currentUser)
                            .reactionType(reactionType)
                            .build()
            );
        } catch (DataIntegrityViolationException ex) {
            // Trường hợp dữ liệu cũ đã có reaction trùng post/user hoặc request bấm quá nhanh.
            // Đọc lại bản ghi đang có và cập nhật thay vì để API bị 500.
            log.warn("Trùng reaction postId={}, userId={}. Tiến hành đọc lại và cập nhật.", post.getId(), currentUser.getId());
            List<PostLike> existingReactions = new ArrayList<>(postLikeRepository.findAllByPostAndUser(post, currentUser));
            cleanupDuplicateReactions(existingReactions);

            if (existingReactions.isEmpty()) {
                throw ex;
            }

            PostLike existingReaction = existingReactions.get(0);
            existingReaction.setReactionType(reactionType);
            return postLikeRepository.saveAndFlush(existingReaction);
        }
    }

    private void cleanupDuplicateReactions(List<PostLike> existingReactions) {
        if (existingReactions.size() <= 1) {
            return;
        }

        for (int i = 1; i < existingReactions.size(); i++) {
            postLikeRepository.delete(existingReactions.get(i));
        }
        postLikeRepository.flush();

        existingReactions.subList(1, existingReactions.size()).clear();
    }

    private void sendReactionNotificationSafely(Post post, User currentUser, ReactionType reactionType) {
        try {
            String senderName = currentUser.getFullName() != null && !currentUser.getFullName().isBlank()
                    ? currentUser.getFullName()
                    : "Một người dùng";

            notificationService.createAndSend(
                    post.getAuthor().getId(),
                    currentUser.getId(),
                    senderName,
                    NotificationType.POST_LIKE,
                    post.getId(),
                    senderName + " đã bày tỏ cảm xúc " + getReactionLabel(reactionType) + " về bài viết của bạn",
                    "/posts/" + post.getId()
            );
        } catch (Exception ex) {
            log.warn("Không thể gửi thông báo reaction cho postId={}: {}", post.getId(), ex.getMessage());
        }
    }

    private ReactionType parseReactionType(String value) {
        if (value == null || value.isBlank()) {
            return ReactionType.LIKE;
        }

        try {
            return ReactionType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return ReactionType.LIKE;
        }
    }

    private String getReactionLabel(ReactionType type) {
        if (type == null) {
            return "thích";
        }

        return switch (type) {
            case LIKE -> "thích";
            case LOVE -> "yêu thích";
            case HAHA -> "haha";
            case WOW -> "wow";
            case SAD -> "buồn";
            case ANGRY -> "phẫn nộ";
        };
    }

    private Map<String, Long> buildReactionCounts(Post post) {
        Map<String, Long> result = new LinkedHashMap<>();
        Arrays.stream(ReactionType.values()).forEach(type -> result.put(type.name(), 0L));

        postLikeRepository.findByPost(post).forEach(item -> {
            ReactionType type = item.getReactionType() != null ? item.getReactionType() : ReactionType.LIKE;
            result.put(type.name(), result.getOrDefault(type.name(), 0L) + 1);
        });

        return result;
    }
}
