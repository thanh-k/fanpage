package com.example.fanpagebackend.modules.notification.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.Date;

@Getter
@Builder
public class NotificationResponse {

    private String id;

    private Long recipientId;

    private Long senderId;

    private String senderName;

    private String type;

    private Long targetId;

    private String message;

    private String redirectUrl;

    private boolean read;

    private Date createdAt;
}