package com.example.fanpagebackend.modules.like.controller;

import com.example.fanpagebackend.common.ApiResponse;
import com.example.fanpagebackend.modules.like.dto.request.ReactionRequest;
import com.example.fanpagebackend.modules.like.dto.response.LikeToggleResponse;
import com.example.fanpagebackend.modules.like.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/posts")
public class LikeController {

    private final LikeService likeService;

    @PostMapping("/{id}/like-toggle")
    public ApiResponse<LikeToggleResponse> toggleLike(
            @PathVariable Long id,
            @RequestBody(required = false) ReactionRequest request
    ) {
        String reactionType = request != null ? request.getReactionType() : null;
        return ApiResponse.success("Cập nhật cảm xúc bài viết thành công", likeService.reactToPost(id, reactionType));
    }

    @PostMapping("/{id}/reactions")
    public ApiResponse<LikeToggleResponse> reactToPost(
            @PathVariable Long id,
            @RequestBody(required = false) ReactionRequest request
    ) {
        String reactionType = request != null ? request.getReactionType() : null;
        return ApiResponse.success("Cập nhật cảm xúc bài viết thành công", likeService.reactToPost(id, reactionType));
    }
}
