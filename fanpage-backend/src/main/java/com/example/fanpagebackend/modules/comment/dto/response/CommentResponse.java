package com.example.fanpagebackend.modules.comment.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class CommentResponse {

    private Long id;
    private Long postId;
    private Long parentId;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private CommentAuthorResponse author;
}
