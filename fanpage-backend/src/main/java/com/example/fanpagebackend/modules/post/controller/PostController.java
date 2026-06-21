package com.example.fanpagebackend.modules.post.controller;

import com.example.fanpagebackend.common.ApiResponse;
import com.example.fanpagebackend.common.PageResponse;
import com.example.fanpagebackend.modules.post.dto.request.CreatePostRequest;
import com.example.fanpagebackend.modules.post.dto.request.UpdatePostRequest;
import com.example.fanpagebackend.modules.post.dto.response.PostResponse;
import com.example.fanpagebackend.modules.post.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping
    public ApiResponse<PageResponse<PostResponse>> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size
    ) {
        return ApiResponse.success("Lấy danh sách bài viết thành công", postService.getFeed(page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse<PostResponse> getPostDetail(@PathVariable Long id) {
        return ApiResponse.success("Lấy chi tiết bài viết thành công", postService.getPostDetail(id));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<PostResponse> createPostJson(@Valid @RequestBody CreatePostRequest request) {
        return ApiResponse.success("Tạo bài viết thành công", postService.createPost(request));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<PostResponse> createPostMultipart(
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "isAnonymous", defaultValue = "false") Boolean anonymous,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @RequestPart(value = "videos", required = false) List<MultipartFile> videos
    ) {
        return ApiResponse.success(
                "Tạo bài viết thành công",
                postService.createPostMultipart(content, anonymous, images, videos)
        );
    }

    @PatchMapping("/{id}")
    public ApiResponse<PostResponse> updatePost(@PathVariable Long id, @Valid @RequestBody UpdatePostRequest request) {
        return ApiResponse.success("Cập nhật bài viết thành công", postService.updateMyPost(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deletePost(@PathVariable Long id) {
        postService.deleteMyPost(id);
        return ApiResponse.success("Xóa bài viết thành công", null);
    }

    @GetMapping("/me")
    public ApiResponse<PageResponse<PostResponse>> getMyPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size
    ) {
        return ApiResponse.success("Lấy bài viết của tôi thành công", postService.getMyPosts(page, size));
    }
}
