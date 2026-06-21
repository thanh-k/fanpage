package com.example.fanpagebackend.modules.chat.dto.websocket;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatSocketRequest {
    private String type;
    private Long receiverId;
    private String content;
}
