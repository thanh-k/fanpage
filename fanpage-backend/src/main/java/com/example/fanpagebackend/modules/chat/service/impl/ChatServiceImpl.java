package com.example.fanpagebackend.modules.chat.service.impl;

import com.example.fanpagebackend.modules.chat.document.ChatMessageDocument;
import com.example.fanpagebackend.modules.chat.document.ConversationDocument;
import com.example.fanpagebackend.modules.chat.dto.request.SendMessageRequest;
import com.example.fanpagebackend.modules.chat.dto.response.ChatMessageResponse;
import com.example.fanpagebackend.modules.chat.dto.response.ConversationSummaryResponse;
import com.example.fanpagebackend.modules.user.dto.response.UserSummaryResponse;
import com.example.fanpagebackend.modules.user.entity.User;
import com.example.fanpagebackend.exception.BadRequestException;
import com.example.fanpagebackend.exception.ForbiddenException;
import com.example.fanpagebackend.modules.friend.repository.FriendRequestRepository;
import com.example.fanpagebackend.modules.chat.repository.mongo.ChatMessageMongoRepository;
import com.example.fanpagebackend.modules.chat.repository.mongo.ConversationMongoRepository;
import com.example.fanpagebackend.modules.chat.service.ChatPresenceService;
import com.example.fanpagebackend.modules.chat.service.ChatService;
import com.example.fanpagebackend.modules.user.service.UserService;
import com.example.fanpagebackend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatMessageMongoRepository chatMessageMongoRepository;
    private final ConversationMongoRepository conversationMongoRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final UserService userService;
    private final SecurityUtil securityUtil;
    private final ChatPresenceService chatPresenceService;

    @Override
    public ChatMessageResponse sendMessage(Long receiverId, SendMessageRequest request) {
        User currentUser = securityUtil.getCurrentUser();
        return sendMessage(currentUser.getId(), receiverId, request);
    }

    @Override
    public ChatMessageResponse sendMessage(Long senderId, Long receiverId, SendMessageRequest request) {
        User sender = userService.getUserEntityById(senderId);
        User receiver = userService.getUserEntityById(receiverId);

        if (sender.getId().equals(receiver.getId())) {
            throw new BadRequestException("Bạn không thể nhắn tin cho chính mình");
        }

        if (!friendRequestRepository.areFriends(sender, receiver)) {
            throw new ForbiddenException("Chỉ có thể nhắn tin với bạn bè");
        }

        String content = request.getContent() == null ? "" : request.getContent().trim();
        if (content.isBlank()) {
            throw new BadRequestException("Nội dung tin nhắn không được để trống");
        }

        LocalDateTime now = LocalDateTime.now();
        String conversationId = buildConversationId(sender.getId(), receiver.getId());

        ChatMessageDocument message = ChatMessageDocument.builder()
                .conversationId(conversationId)
                .senderId(sender.getId())
                .receiverId(receiver.getId())
                .content(content)
                .type("TEXT")
                .read(false)
                .createdAt(now)
                .build();

        ChatMessageDocument saved = chatMessageMongoRepository.save(message);

        ConversationDocument conversation = conversationMongoRepository.findById(conversationId)
                .orElseGet(() -> ConversationDocument.builder()
                        .id(conversationId)
                        .participantIds(List.of(Math.min(sender.getId(), receiver.getId()), Math.max(sender.getId(), receiver.getId())))
                        .build());

        conversation.setLastMessage(content);
        conversation.setLastSenderId(sender.getId());
        conversation.setLastMessageAt(now);
        conversation.setUpdatedAt(now);
        conversationMongoRepository.save(conversation);

        return toResponse(saved, sender.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getConversation(Long userId, int limit) {
        User currentUser = securityUtil.getCurrentUser();
        User friend = userService.getUserEntityById(userId);

        if (!friendRequestRepository.areFriends(currentUser, friend)) {
            throw new ForbiddenException("Chỉ có thể xem tin nhắn với bạn bè");
        }

        int safeLimit = Math.min(Math.max(limit, 1), 100);
        String conversationId = buildConversationId(currentUser.getId(), friend.getId());

        List<ChatMessageDocument> newestFirst = chatMessageMongoRepository.findByConversationIdOrderByCreatedAtDesc(
                conversationId,
                PageRequest.of(0, safeLimit)
        );
        Collections.reverse(newestFirst);

        return newestFirst.stream()
                .map(message -> toResponse(message, currentUser.getId()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationSummaryResponse> getConversations() {
        User currentUser = securityUtil.getCurrentUser();
        return conversationMongoRepository.findByParticipantIdsContainingOrderByLastMessageAtDesc(currentUser.getId())
                .stream()
                .map(conversation -> toConversationSummary(conversation, currentUser.getId()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadTotal() {
        User currentUser = securityUtil.getCurrentUser();
        return chatMessageMongoRepository.countByReceiverIdAndReadFalse(currentUser.getId());
    }

    @Override
    public long markConversationAsRead(Long userId) {
        User currentUser = securityUtil.getCurrentUser();
        User friend = userService.getUserEntityById(userId);

        if (!friendRequestRepository.areFriends(currentUser, friend)) {
            throw new ForbiddenException("Chỉ có thể đánh dấu đã đọc tin nhắn với bạn bè");
        }

        String conversationId = buildConversationId(currentUser.getId(), friend.getId());
        List<ChatMessageDocument> unreadMessages = chatMessageMongoRepository
                .findByConversationIdAndReceiverIdAndReadFalse(conversationId, currentUser.getId());

        LocalDateTime now = LocalDateTime.now();
        unreadMessages.forEach(message -> {
            message.setRead(true);
            message.setReadAt(now);
        });
        chatMessageMongoRepository.saveAll(unreadMessages);
        return unreadMessages.size();
    }

    @Override
    public String buildConversationId(Long firstUserId, Long secondUserId) {
        long min = Math.min(firstUserId, secondUserId);
        long max = Math.max(firstUserId, secondUserId);
        return min + "_" + max;
    }

    private ConversationSummaryResponse toConversationSummary(ConversationDocument conversation, Long currentUserId) {
        Long peerId = conversation.getParticipantIds().stream()
                .filter(id -> !id.equals(currentUserId))
                .findFirst()
                .orElse(currentUserId);

        User peer = userService.getUserEntityById(peerId);
        long unread = chatMessageMongoRepository.countByConversationIdAndReceiverIdAndReadFalse(
                conversation.getId(), currentUserId
        );
        boolean online = chatPresenceService.isOnline(peerId);

        return ConversationSummaryResponse.builder()
                .conversationId(conversation.getId())
                .user(toUserSummary(peer, online))
                .lastMessage(conversation.getLastMessage())
                .lastMessageAt(conversation.getLastMessageAt())
                .unreadCount(unread)
                .online(online)
                .build();
    }

    private UserSummaryResponse toUserSummary(User user, boolean online) {
        return UserSummaryResponse.builder()
                .id(user.getId())
                .name(user.getFullName())
                .username(user.getUsername())
                .avatar(user.getAvatar())
                .bio(user.getBio())
                .friendshipStatus("FRIEND")
                .online(online)
                .build();
    }

    private ChatMessageResponse toResponse(ChatMessageDocument message, Long currentUserId) {
        boolean mine = message.getSenderId().equals(currentUserId);
        Long peerId = mine ? message.getReceiverId() : message.getSenderId();
        return ChatMessageResponse.builder()
                .id(message.getId())
                .conversationId(message.getConversationId())
                .peerId(peerId)
                .content(message.getContent())
                .mine(mine)
                .read(message.isRead())
                .createdAt(message.getCreatedAt())
                .readAt(message.getReadAt())
                .build();
    }
}
