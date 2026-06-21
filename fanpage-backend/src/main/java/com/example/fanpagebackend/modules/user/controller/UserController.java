package com.example.fanpagebackend.modules.user.controller;

import com.example.fanpagebackend.common.ApiResponse;
import com.example.fanpagebackend.common.PageResponse;
import com.example.fanpagebackend.modules.user.dto.request.UpdateMyProfileRequest;
import com.example.fanpagebackend.modules.post.dto.response.PostResponse;
import com.example.fanpagebackend.modules.user.dto.response.PublicUserProfileResponse;
import com.example.fanpagebackend.modules.user.dto.response.UserProfileResponse;
import com.example.fanpagebackend.modules.user.dto.response.UserSummaryResponse;
import com.example.fanpagebackend.common.dto.response.MessageResponse;
import com.example.fanpagebackend.modules.accountdeletion.dto.request.CreateAccountDeletionRequest;
import com.example.fanpagebackend.modules.post.service.PostService;
import com.example.fanpagebackend.modules.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final PostService postService;

    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> getMyProfile() {
        return ApiResponse.success("Lấy hồ sơ của tôi thành công", userService.getMyProfile());
    }

    @PutMapping(value = "/me", consumes = {"multipart/form-data"})
    public ApiResponse<UserProfileResponse> updateMyProfile(@Valid @ModelAttribute UpdateMyProfileRequest request) {
        return ApiResponse.success("Cập nhật hồ sơ thành công", userService.updateMyProfile(request));
    }

    @GetMapping("/search")
    public ApiResponse<List<UserSummaryResponse>> searchUsers(@RequestParam(defaultValue = "") String keyword) {
        return ApiResponse.success("Tìm kiếm người dùng thành công", userService.searchUsers(keyword));
    }

    @PostMapping("/me/account-deletion-request")
    public ApiResponse<MessageResponse> requestAccountDeletion(@RequestBody(required = false) CreateAccountDeletionRequest request) {
        String reason = request == null ? null : request.getReason();
        return ApiResponse.success("Gửi yêu cầu hủy tài khoản thành công", userService.requestAccountDeletion(reason));
    }

    @GetMapping("/{id}/public")
    public ApiResponse<PublicUserProfileResponse> getPublicProfile(@PathVariable Long id) {
        return ApiResponse.success("Lấy hồ sơ công khai thành công", userService.getPublicProfile(id));
    }

    @GetMapping("/{id}/posts/public")
    public ApiResponse<PageResponse<PostResponse>> getPublicPosts(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size
    ) {
        return ApiResponse.success(
                "Lấy danh sách bài viết công khai thành công",
                postService.getPublicPostsByUser(id, page, size)
        );
    }
}
