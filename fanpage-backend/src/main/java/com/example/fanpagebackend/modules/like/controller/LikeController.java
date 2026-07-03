package com.example.fanpagebackend.modules.like.controller;

import com.example.fanpagebackend.common.ApiResponse;
import com.example.fanpagebackend.modules.like.dto.request.ReactionRequest;
import com.example.fanpagebackend.modules.like.dto.response.LikeToggleResponse;
import com.example.fanpagebackend.modules.like.dto.response.ReactionUserResponse;

import java.util.List;
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

    @GetMapping("/{id}/reactions/users")
    public ApiResponse<List<ReactionUserResponse>> getReactionUsers(@PathVariable Long id) {
        return ApiResponse.success("Lấy danh sách người thả cảm xúc thành công", likeService.getReactionUsers(id));
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
