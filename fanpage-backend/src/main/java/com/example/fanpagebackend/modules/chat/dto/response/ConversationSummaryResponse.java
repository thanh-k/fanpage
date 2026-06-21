package com.example.fanpagebackend.modules.chat.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import com.example.fanpagebackend.modules.user.dto.response.UserSummaryResponse;

@Getter
@Builder
public class ConversationSummaryResponse {
    private String conversationId;
    private UserSummaryResponse user;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private long unreadCount;
    private boolean online;
}
