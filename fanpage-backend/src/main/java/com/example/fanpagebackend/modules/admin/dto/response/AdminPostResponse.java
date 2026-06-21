package com.example.fanpagebackend.modules.admin.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminPostResponse {
    private Long id;
    private String content;
    private boolean anonymous;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long authorId;
    private String authorName;
    private String authorUsername;
    private String authorEmail;
    private long likesCount;
    private long commentCount;
}
