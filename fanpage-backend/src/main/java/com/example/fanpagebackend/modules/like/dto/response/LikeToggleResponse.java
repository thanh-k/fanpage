package com.example.fanpagebackend.modules.like.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
@Builder
public class LikeToggleResponse {

    private Long postId;
    private boolean liked;
    private long likesCount;
    private String reactionType;
    private Map<String, Long> reactionCounts;
}
