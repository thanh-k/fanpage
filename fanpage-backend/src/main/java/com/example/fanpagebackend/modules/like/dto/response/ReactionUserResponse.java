package com.example.fanpagebackend.modules.like.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ReactionUserResponse {
    private Long userId;
    private String name;
    private String username;
    private String avatar;
    private String reactionType;
    private LocalDateTime reactedAt;
}
