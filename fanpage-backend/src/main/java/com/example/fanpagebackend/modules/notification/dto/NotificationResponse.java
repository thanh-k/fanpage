package com.example.fanpagebackend.modules.notification.dto;

import lombok.*;

import java.util.Date;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private String id;

    private Long senderId;

    private String senderName;

    private String senderAvatar;

    private String type;

    private Long targetId;

    private String message;

    private boolean read;

    private Date createdAt;
}