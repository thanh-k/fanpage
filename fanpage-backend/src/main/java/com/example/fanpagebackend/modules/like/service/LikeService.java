package com.example.fanpagebackend.modules.like.service;

import com.example.fanpagebackend.modules.like.dto.response.LikeToggleResponse;
import com.example.fanpagebackend.modules.like.dto.response.ReactionUserResponse;
import java.util.List;

public interface LikeService {

    LikeToggleResponse toggleLike(Long postId);

    LikeToggleResponse reactToPost(Long postId, String reactionType);
    List<ReactionUserResponse> getReactionUsers(Long postId);
}
