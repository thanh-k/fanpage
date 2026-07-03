package com.example.fanpagebackend.modules.post.mapper;

import com.example.fanpagebackend.modules.auth.dto.response.*;
import com.example.fanpagebackend.modules.user.dto.response.*;
import com.example.fanpagebackend.modules.post.dto.response.*;
import com.example.fanpagebackend.modules.comment.dto.response.*;
import com.example.fanpagebackend.modules.like.dto.response.*;
import com.example.fanpagebackend.modules.friend.dto.response.*;
import com.example.fanpagebackend.modules.chat.dto.response.*;
import com.example.fanpagebackend.modules.admin.dto.response.*;
import com.example.fanpagebackend.common.dto.response.*;
import com.example.fanpagebackend.modules.comment.entity.Comment;
import com.example.fanpagebackend.modules.post.entity.Post;
import com.example.fanpagebackend.modules.post.entity.PostMedia;
import com.example.fanpagebackend.modules.user.entity.User;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import com.example.fanpagebackend.modules.comment.dto.response.CommentAuthorResponse;
import com.example.fanpagebackend.modules.comment.dto.response.CommentResponse;
import com.example.fanpagebackend.modules.post.dto.response.PostAuthorResponse;
import com.example.fanpagebackend.modules.post.dto.response.PostMediaResponse;
import com.example.fanpagebackend.modules.post.dto.response.PostResponse;

@Component
public class PostMapper {

    public PostResponse toPostResponse(
            Post post,
            List<Comment> comments,
            long likesCount,
            Map<String, Long> reactionCounts,
            String currentReactionType,
            boolean likedByCurrentUser,
            boolean includeComments,
            Long currentUserId
    ) {
        User author = post.getAuthor();

        PostAuthorResponse authorResponse = post.isAnonymous()
                ? null
                : PostAuthorResponse.builder()
                .id(author.getId())
                .name(author.getFullName())
                .username(author.getUsername())
                .avatar(author.getAvatar())
                .build();

        List<PostMediaResponse> mediaResponses = post.getMediaList()
                .stream()
                .map(this::toPostMediaResponse)
                .toList();

        List<CommentResponse> commentResponses = includeComments
                ? comments.stream().map(this::toCommentResponse).toList()
                : List.of();

        return PostResponse.builder()
                .id(post.getId())
                .authorId(author.getId())
                .content(post.getContent())
                .isAnonymous(post.isAnonymous())
                .status(post.getStatus().name())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .author(authorResponse)
                .authorDisplayName(post.isAnonymous() ? "Người dùng ẩn danh" : author.getFullName())
                .media(mediaResponses)
                .likesCount(likesCount)
                .reactionCounts(reactionCounts)
                .currentReactionType(currentReactionType)
                .commentCount(comments.size())
                .likedByCurrentUser(likedByCurrentUser)
                .comments(commentResponses)
                .canDelete(currentUserId != null && currentUserId.equals(author.getId()))
                .canEdit(currentUserId != null && currentUserId.equals(author.getId()))
                .build();
    }

    private PostMediaResponse toPostMediaResponse(PostMedia media) {
        return PostMediaResponse.builder()
                .id(media.getId())
                .url(media.getUrl())
                .type(media.getType())
                .sortOrder(media.getSortOrder())
                .build();
    }

    public CommentResponse toCommentResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPost().getId())
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .author(CommentAuthorResponse.builder()
                        .id(comment.getAuthor().getId())
                        .name(comment.getAuthor().getFullName())
                        .username(comment.getAuthor().getUsername())
                        .avatar(comment.getAuthor().getAvatar())
                        .build())
                .build();
    }
}
