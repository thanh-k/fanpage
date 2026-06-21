package com.example.fanpagebackend.modules.notification.controller;

import com.example.fanpagebackend.modules.notification.dto.response.NotificationResponse;
import com.example.fanpagebackend.modules.notification.service.NotificationService;
import com.example.fanpagebackend.modules.user.entity.User;
import com.example.fanpagebackend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    private final SecurityUtil securityUtil;

    @GetMapping
    public List<NotificationResponse> getMyNotifications() {

        try {

            User currentUser =
                    securityUtil.getCurrentUser();

            if (currentUser == null) {
                return Collections.emptyList();
            }

            return notificationService
                    .getMyNotifications(currentUser.getId());

        } catch (Exception e) {

            e.printStackTrace();

            return Collections.emptyList();
        }
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount() {

        User currentUser =
                securityUtil.getCurrentUser();

        long count =
                notificationService.getUnreadCount(
                        currentUser.getId()
                );

        return Map.of("count", count);
    }

    @PutMapping("/{id}/read")
    public void markAsRead(
            @PathVariable String id
    ) {

        notificationService.markAsRead(id);
    }

    @PutMapping("/read-all")
    public void markAllAsRead() {

        User currentUser =
                securityUtil.getCurrentUser();

        notificationService.markAllAsRead(
                currentUser.getId()
        );
    }
}