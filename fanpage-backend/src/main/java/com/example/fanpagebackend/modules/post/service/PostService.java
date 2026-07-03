package com.example.fanpagebackend.modules.post.service;

import com.example.fanpagebackend.common.PageResponse;
import com.example.fanpagebackend.modules.post.dto.request.CreatePostRequest;
import com.example.fanpagebackend.modules.post.dto.request.UpdatePostRequest;
import com.example.fanpagebackend.modules.post.dto.response.PostResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PostService {

    PageResponse<PostResponse> getFeed(int page, int size);

    PostResponse getPostDetail(Long postId);

    PostResponse createPost(CreatePostRequest request);

    PostResponse createPostMultipart(
            String content,
            Boolean anonymous,
            List<MultipartFile> images,
            List<MultipartFile> videos
    );

    PostResponse updateMyPost(Long postId, UpdatePostRequest request);

    PostResponse updateMyPostMultipart(Long postId, String content, Boolean anonymous, List<MultipartFile> images, List<MultipartFile> videos, Boolean keepExistingMedia);

    void deleteMyPost(Long postId);

    PageResponse<PostResponse> getMyPosts(int page, int size);

    PageResponse<PostResponse> getPublicPostsByUser(Long userId, int page, int size);
}
