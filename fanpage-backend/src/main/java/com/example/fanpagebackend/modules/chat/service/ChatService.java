package com.example.fanpagebackend.modules.chat.service;

import com.example.fanpagebackend.modules.chat.dto.request.SendMessageRequest;
import com.example.fanpagebackend.modules.chat.dto.response.ChatMessageResponse;
import com.example.fanpagebackend.modules.chat.dto.response.ConversationSummaryResponse;

import java.util.List;

public interface ChatService {
    ChatMessageResponse sendMessage(Long receiverId, SendMessageRequest request);
    ChatMessageResponse sendMessage(Long senderId, Long receiverId, SendMessageRequest request);
    List<ChatMessageResponse> getConversation(Long userId, int limit);
    List<ConversationSummaryResponse> getConversations();
    List<ConversationSummaryResponse> getConversations(int limit, int offset);
    long getUnreadTotal();
    long markConversationAsRead(Long userId);
    ChatMessageResponse revokeMessage(String messageId);
    String buildConversationId(Long firstUserId, Long secondUserId);
}
