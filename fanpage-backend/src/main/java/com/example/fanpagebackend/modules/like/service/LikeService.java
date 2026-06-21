package com.example.fanpagebackend.modules.like.service;

import com.example.fanpagebackend.modules.like.dto.response.LikeToggleResponse;

public interface LikeService {

    LikeToggleResponse toggleLike(Long postId);

    LikeToggleResponse reactToPost(Long postId, String reactionType);
}
