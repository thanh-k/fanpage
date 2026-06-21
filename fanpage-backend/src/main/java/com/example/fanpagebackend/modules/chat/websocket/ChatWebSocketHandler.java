package com.example.fanpagebackend.modules.chat.websocket;

import com.example.fanpagebackend.modules.chat.dto.request.SendMessageRequest;
import com.example.fanpagebackend.modules.chat.dto.response.ChatMessageResponse;
import com.example.fanpagebackend.modules.chat.dto.websocket.ChatSocketRequest;
import com.example.fanpagebackend.modules.chat.dto.websocket.ChatSocketResponse;
import com.example.fanpagebackend.modules.chat.service.ChatPresenceService;
import com.example.fanpagebackend.modules.chat.service.ChatService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final ChatService chatService;
    private final ChatPresenceService chatPresenceService;
    private final ObjectMapper objectMapper;

    private final ConcurrentHashMap<Long, Set<WebSocketSession>> sessionsByUserId = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        Long userId = getUserId(session);
        if (userId == null) return;

        sessionsByUserId
                .computeIfAbsent(userId, ignored -> ConcurrentHashMap.newKeySet())
                .add(session);

        boolean firstSession = chatPresenceService.userConnected(userId);

        sendToSession(session, ChatSocketResponse.builder()
                .type("CONNECTED")
                .message("Kết nối chat realtime thành công")
                .build());

        sendToSession(session, ChatSocketResponse.builder()
                .type("ONLINE_USERS")
                .data(chatPresenceService.getOnlineUserIds())
                .message("Danh sách người dùng đang online")
                .build());

        if (firstSession) {
            broadcast(ChatSocketResponse.builder()
                    .type("USER_ONLINE")
                    .data(userId)
                    .message("Người dùng đang hoạt động")
                    .build());
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage textMessage) {
        Long senderId = getUserId(session);
        if (senderId == null) return;

        try {
            ChatSocketRequest socketRequest = objectMapper.readValue(textMessage.getPayload(), ChatSocketRequest.class);
            if (!"CHAT_MESSAGE".equals(socketRequest.getType())) {
                sendError(session, "Loại sự kiện không hợp lệ");
                return;
            }

            SendMessageRequest request = new SendMessageRequest();
            request.setContent(socketRequest.getContent());

            ChatMessageResponse senderResponse = chatService.sendMessage(senderId, socketRequest.getReceiverId(), request);

            ChatSocketResponse toSender = ChatSocketResponse.builder()
                    .type("CHAT_MESSAGE")
                    .data(senderResponse)
                    .message("Gửi tin nhắn thành công")
                    .build();
            sendToUser(senderId, toSender);

            ChatMessageResponse receiverResponse = ChatMessageResponse.builder()
                    .id(senderResponse.getId())
                    .conversationId(senderResponse.getConversationId())
                    .peerId(senderId)
                    .content(senderResponse.getContent())
                    .mine(false)
                    .read(false)
                    .createdAt(senderResponse.getCreatedAt())
                    .readAt(senderResponse.getReadAt())
                    .build();

            ChatSocketResponse toReceiver = ChatSocketResponse.builder()
                    .type("CHAT_MESSAGE")
                    .data(receiverResponse)
                    .message("Có tin nhắn mới")
                    .build();
            sendToUser(socketRequest.getReceiverId(), toReceiver);
        } catch (Exception exception) {
            sendError(session, exception.getMessage() == null ? "Không thể gửi tin nhắn" : exception.getMessage());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Long userId = getUserId(session);
        if (userId == null) return;

        Set<WebSocketSession> sessions = sessionsByUserId.get(userId);
        if (sessions != null) {
            sessions.remove(session);
            if (sessions.isEmpty()) {
                sessionsByUserId.remove(userId);
            }
        }

        boolean lastSession = chatPresenceService.userDisconnected(userId);
        if (lastSession) {
            broadcast(ChatSocketResponse.builder()
                    .type("USER_OFFLINE")
                    .data(userId)
                    .message("Người dùng đã offline")
                    .build());
        }
    }

    private Long getUserId(WebSocketSession session) {
        Object value = session.getAttributes().get("userId");
        return value instanceof Long ? (Long) value : null;
    }

    private void sendToUser(Long userId, ChatSocketResponse response) {
        Set<WebSocketSession> sessions = sessionsByUserId.get(userId);
        if (sessions == null || sessions.isEmpty()) return;
        sessions.forEach(session -> sendToSession(session, response));
    }

    private void broadcast(ChatSocketResponse response) {
        sessionsByUserId.values().forEach(sessions -> sessions.forEach(session -> sendToSession(session, response)));
    }

    private void sendError(WebSocketSession session, String message) {
        sendToSession(session, ChatSocketResponse.builder()
                .type("ERROR")
                .message(message)
                .build());
    }

    private void sendToSession(WebSocketSession session, ChatSocketResponse response) {
        try {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
            }
        } catch (Exception ignored) {
        }
    }
}
