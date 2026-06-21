package com.example.fanpagebackend.modules.chat.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ChatMessageResponse {
    private String id;
    private String conversationId;
    private Long peerId;
    private String content;
    private boolean mine;
    private boolean read;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
}
