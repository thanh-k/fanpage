package com.example.fanpagebackend.modules.notification.service;

import com.example.fanpagebackend.modules.notification.dto.response.NotificationResponse;
import com.example.fanpagebackend.modules.notification.entity.Notification;
import com.example.fanpagebackend.modules.notification.mapper.NotificationMapper;
import com.example.fanpagebackend.modules.notification.repository.NotificationRepository;
import com.example.fanpagebackend.modules.notification.websocket.NotificationWebSocketHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    private final NotificationWebSocketHandler notificationWebSocketHandler;

    private final NotificationMapper notificationMapper;

    private final ObjectMapper objectMapper;

    public void createAndSend(
            Long recipientId,
            Long senderId,
            String senderName,
            String type,
            Long targetId,
            String message,
            String redirectUrl
    ) {

        Notification notification = Notification.builder()
                .recipientId(recipientId)
                .senderId(senderId)
                .senderName(senderName)
                .type(type)
                .targetId(targetId)
                .message(message)
                .redirectUrl(redirectUrl)
                .read(false)
                .createdAt(new Date())
                .build();

        notificationRepository.save(notification);

        try {

            NotificationResponse response =
                    notificationMapper.toResponse(notification);

            String payload =
                    objectMapper.writeValueAsString(response);

            notificationWebSocketHandler.sendRealtimeNotification(
                    recipientId,
                    payload
            );

        } catch (Exception e) {

            e.printStackTrace();
        }
    }

    public List<NotificationResponse> getMyNotifications(Long userId) {

        return notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(notificationMapper::toResponse)
                .toList();
    }

    public long getUnreadCount(Long userId) {

        return notificationRepository
                .countByRecipientIdAndReadFalse(userId);
    }

    public void markAsRead(String notificationId) {

        Notification notification =
                notificationRepository.findById(notificationId)
                        .orElseThrow();

        notification.setRead(true);

        notificationRepository.save(notification);
    }

    public void markAllAsRead(Long userId) {

        List<Notification> notifications =
                notificationRepository
                        .findByRecipientIdOrderByCreatedAtDesc(userId);

        notifications.forEach(item -> item.setRead(true));

        notificationRepository.saveAll(notifications);
    }
}