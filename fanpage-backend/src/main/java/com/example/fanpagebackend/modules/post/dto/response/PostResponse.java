package com.example.fanpagebackend.modules.post.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import com.example.fanpagebackend.modules.comment.dto.response.CommentResponse;

@Getter
@Builder
public class PostResponse {

    private Long id;
    private Long authorId;
    private String content;
    @JsonProperty("isAnonymous")
    private boolean isAnonymous;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private PostAuthorResponse author;
    private String authorDisplayName;
    private List<PostMediaResponse> media;
    private long likesCount;
    private Map<String, Long> reactionCounts;
    private String currentReactionType;
    private long commentCount;
    private boolean likedByCurrentUser;
    private List<CommentResponse> comments;
    private boolean canDelete;
    private boolean canEdit;
}
