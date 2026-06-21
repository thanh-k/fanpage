package com.example.fanpagebackend.modules.friend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import com.example.fanpagebackend.modules.user.dto.response.UserSummaryResponse;

@Getter
@Builder
public class FriendRequestResponse {
    private Long id;
    private String status;
    private UserSummaryResponse requester;
    private UserSummaryResponse addressee;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
