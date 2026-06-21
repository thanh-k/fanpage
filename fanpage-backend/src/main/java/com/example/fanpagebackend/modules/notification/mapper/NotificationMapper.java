package com.example.fanpagebackend.modules.notification.mapper;

import com.example.fanpagebackend.modules.notification.dto.response.NotificationResponse;
import com.example.fanpagebackend.modules.notification.entity.Notification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationResponse toResponse(Notification notification) {

        if (notification == null) {
            return null;
        }

        return NotificationResponse.builder()
                .id(notification.getId())
                .recipientId(notification.getRecipientId())
                .senderId(notification.getSenderId())
                .senderName(notification.getSenderName())
                .type(notification.getType())
                .targetId(notification.getTargetId())
                .message(notification.getMessage())
                .redirectUrl(notification.getRedirectUrl())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}