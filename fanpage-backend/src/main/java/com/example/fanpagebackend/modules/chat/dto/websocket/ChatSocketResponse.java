package com.example.fanpagebackend.modules.chat.dto.websocket;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ChatSocketResponse {
    private String type;
    private Object data;
    private String message;
}
