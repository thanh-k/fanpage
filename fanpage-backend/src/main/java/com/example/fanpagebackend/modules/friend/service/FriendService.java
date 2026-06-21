package com.example.fanpagebackend.modules.friend.service;

import com.example.fanpagebackend.modules.friend.dto.response.FriendRequestResponse;
import com.example.fanpagebackend.modules.user.dto.response.UserSummaryResponse;

import java.util.List;

public interface FriendService {
    FriendRequestResponse sendRequest(Long userId);
    FriendRequestResponse acceptRequest(Long requestId);
    void rejectRequest(Long requestId);
    void removeFriend(Long userId);
    List<UserSummaryResponse> getFriends();
    List<FriendRequestResponse> getReceivedRequests();
    List<FriendRequestResponse> getSentRequests();
    String getFriendshipStatus(Long otherUserId);
}
