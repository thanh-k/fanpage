package com.example.fanpagebackend.modules.chat.controller;

import com.example.fanpagebackend.common.ApiResponse;
import com.example.fanpagebackend.modules.chat.dto.request.SendMessageRequest;
import com.example.fanpagebackend.modules.chat.dto.response.ChatMessageResponse;
import com.example.fanpagebackend.modules.chat.dto.response.ConversationSummaryResponse;
import com.example.fanpagebackend.modules.chat.service.ChatPresenceService;
import com.example.fanpagebackend.modules.chat.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final ChatPresenceService chatPresenceService;

    @GetMapping("/conversations")
    public ApiResponse<List<ConversationSummaryResponse>> getConversations() {
        return ApiResponse.success("Lấy danh sách đoạn chat thành công", chatService.getConversations());
    }

    @GetMapping("/unread-count")
    public ApiResponse<Map<String, Long>> getUnreadCount() {
        return ApiResponse.success("Lấy số tin nhắn chưa đọc thành công", Map.of("count", chatService.getUnreadTotal()));
    }

    @GetMapping("/online-users")
    public ApiResponse<Set<Long>> getOnlineUsers() {
        return ApiResponse.success("Lấy danh sách người dùng online thành công", chatPresenceService.getOnlineUserIds());
    }

    @PostMapping("/{userId}/read")
    public ApiResponse<Map<String, Long>> markConversationAsRead(@PathVariable Long userId) {
        long count = chatService.markConversationAsRead(userId);
        return ApiResponse.success("Đã đánh dấu tin nhắn là đã đọc", Map.of("count", count));
    }

    @GetMapping("/{userId}/messages")
    public ApiResponse<List<ChatMessageResponse>> getConversation(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "50") int limit
    ) {
        return ApiResponse.success("Lấy tin nhắn thành công", chatService.getConversation(userId, limit));
    }

    @PostMapping("/{userId}/messages")
    public ApiResponse<ChatMessageResponse> sendMessage(
            @PathVariable Long userId,
            @Valid @RequestBody SendMessageRequest request
    ) {
        return ApiResponse.success("Gửi tin nhắn thành công", chatService.sendMessage(userId, request));
    }
}
