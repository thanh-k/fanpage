package com.example.fanpagebackend.modules.search.controller;

import com.example.fanpagebackend.common.ApiResponse;
import com.example.fanpagebackend.modules.post.entity.Post;
import com.example.fanpagebackend.modules.post.mapper.PostMapper;
import com.example.fanpagebackend.modules.post.repository.PostRepository;
import com.example.fanpagebackend.modules.search.dto.response.GlobalSearchResponse;
import com.example.fanpagebackend.modules.user.dto.response.UserSummaryResponse;
import com.example.fanpagebackend.modules.user.entity.User;
import com.example.fanpagebackend.modules.user.repository.UserRepository;
import com.example.fanpagebackend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final PostMapper postMapper;
    private final SecurityUtil securityUtil;

    @GetMapping
    public ApiResponse<GlobalSearchResponse> search(@RequestParam("q") String q) {
        User currentUser = securityUtil.getCurrentUser();
        String keyword = q == null ? "" : q.trim();
        if (keyword.isBlank()) {
            return ApiResponse.success("Tìm kiếm thành công", GlobalSearchResponse.builder().users(List.of()).posts(List.of()).build());
        }
        List<UserSummaryResponse> users = userRepository.searchUsers(keyword, currentUser.getId()).stream()
                .limit(10)
                .map(user -> UserSummaryResponse.builder()
                        .id(user.getId()).name(user.getFullName()).username(user.getUsername()).avatar(user.getAvatar())
                        .bio(user.getBio()).friendshipStatus(null).online(false).build())
                .toList();
        List<Post> foundPosts = postRepository.searchPublicPosts(keyword, PageRequest.of(0, 10)).getContent();
        var posts = foundPosts.stream()
                .map(post -> postMapper.toPostResponse(post, List.of(), 0, Map.of(), null, false, false, currentUser.getId()))
                .toList();
        return ApiResponse.success("Tìm kiếm thành công", GlobalSearchResponse.builder().users(users).posts(posts).build());
    }
}
