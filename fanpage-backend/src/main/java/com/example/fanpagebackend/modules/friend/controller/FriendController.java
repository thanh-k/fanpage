package com.example.fanpagebackend.modules.friend.controller;

import com.example.fanpagebackend.common.ApiResponse;
import com.example.fanpagebackend.modules.friend.dto.response.FriendRequestResponse;
import com.example.fanpagebackend.modules.user.dto.response.UserSummaryResponse;
import com.example.fanpagebackend.modules.friend.service.FriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;

    @GetMapping
    public ApiResponse<List<UserSummaryResponse>> getFriends() {
        return ApiResponse.success("Lấy danh sách bạn bè thành công", friendService.getFriends());
    }

    @PostMapping("/requests/{userId}")
    public ApiResponse<FriendRequestResponse> sendRequest(@PathVariable Long userId) {
        return ApiResponse.success("Gửi lời mời kết bạn thành công", friendService.sendRequest(userId));
    }

    @GetMapping("/requests/received")
    public ApiResponse<List<FriendRequestResponse>> getReceivedRequests() {
        return ApiResponse.success("Lấy lời mời kết bạn đã nhận thành công", friendService.getReceivedRequests());
    }

    @GetMapping("/requests/sent")
    public ApiResponse<List<FriendRequestResponse>> getSentRequests() {
        return ApiResponse.success("Lấy lời mời kết bạn đã gửi thành công", friendService.getSentRequests());
    }

    @PostMapping("/requests/{requestId}/accept")
    public ApiResponse<FriendRequestResponse> acceptRequest(@PathVariable Long requestId) {
        return ApiResponse.success("Chấp nhận kết bạn thành công", friendService.acceptRequest(requestId));
    }

    @PostMapping("/requests/{requestId}/reject")
    public ApiResponse<Void> rejectRequest(@PathVariable Long requestId) {
        friendService.rejectRequest(requestId);
        return ApiResponse.success("Từ chối lời mời kết bạn thành công", null);
    }

    @DeleteMapping("/{userId}")
    public ApiResponse<Void> removeFriend(@PathVariable Long userId) {
        friendService.removeFriend(userId);
        return ApiResponse.success("Hủy kết bạn thành công", null);
    }
}
