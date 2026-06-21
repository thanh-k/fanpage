package com.example.fanpagebackend.modules.notification.websocket;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Set;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class NotificationWebSocketHandler extends TextWebSocketHandler {

    // 1 USER -> NHIỀU SESSION
    private static final Map<Long, Set<WebSocketSession>> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {

        Long userId = getUserIdFromSession(session);

        if (userId != null) {

            sessions.computeIfAbsent(
                    userId,
                    k -> ConcurrentHashMap.newKeySet()
            ).add(session);

            System.out.println("User connected notification socket: " + userId);
        }
    }

    @Override
    public void afterConnectionClosed(
            WebSocketSession session,
            CloseStatus status
    ) throws Exception {

        Long userId = getUserIdFromSession(session);

        if (userId != null) {

            Set<WebSocketSession> userSessions = sessions.get(userId);

            if (userSessions != null) {

                userSessions.remove(session);

                // nếu không còn session nào thì remove luôn user
                if (userSessions.isEmpty()) {
                    sessions.remove(userId);
                }
            }

            System.out.println("User disconnected notification socket: " + userId);
        }
    }

    // GỬI REALTIME TOÀN BỘ SESSION
    public void sendRealtimeNotification(
            Long recipientId,
            String jsonPayload
    ) {

        Set<WebSocketSession> userSessions = sessions.get(recipientId);

        if (userSessions == null || userSessions.isEmpty()) {
            return;
        }

        userSessions.removeIf(session -> !session.isOpen());

        for (WebSocketSession session : userSessions) {

            try {

                session.sendMessage(
                        new TextMessage(jsonPayload)
                );

            } catch (IOException e) {

                e.printStackTrace();
            }
        }
    }

    private Long getUserIdFromSession(WebSocketSession session) {

        Object userId = session.getAttributes().get("userId");

        if (userId instanceof Long) {
            return (Long) userId;
        }

        if (userId instanceof String) {
            return Long.parseLong((String) userId);
        }

        return null;
    }
}