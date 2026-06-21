package com.example.fanpagebackend.modules.comment.controller;

import com.example.fanpagebackend.common.ApiResponse;
import com.example.fanpagebackend.modules.comment.dto.request.AddCommentRequest;
import com.example.fanpagebackend.modules.comment.dto.response.CommentResponse;
import com.example.fanpagebackend.modules.comment.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/posts/{postId}/comments")
public class CommentController {

    private final CommentService commentService;

    @GetMapping
    public ApiResponse<List<CommentResponse>> getComments(@PathVariable Long postId) {
        return ApiResponse.success("Lấy bình luận thành công", commentService.getCommentsByPost(postId));
    }

    @PostMapping
    public ApiResponse<CommentResponse> addComment(
            @PathVariable Long postId,
            @Valid @RequestBody AddCommentRequest request
    ) {
        return ApiResponse.success("Thêm bình luận thành công", commentService.addComment(postId, request));
    }
}
