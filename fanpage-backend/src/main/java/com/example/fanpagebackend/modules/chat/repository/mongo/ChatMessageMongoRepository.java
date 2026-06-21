package com.example.fanpagebackend.modules.chat.repository.mongo;

import com.example.fanpagebackend.modules.chat.document.ChatMessageDocument;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatMessageMongoRepository extends MongoRepository<ChatMessageDocument, String> {
    List<ChatMessageDocument> findByConversationIdOrderByCreatedAtDesc(String conversationId, Pageable pageable);
    List<ChatMessageDocument> findByConversationIdAndReceiverIdAndReadFalse(String conversationId, Long receiverId);
    long countByReceiverIdAndReadFalse(Long receiverId);
    long countByConversationIdAndReceiverIdAndReadFalse(String conversationId, Long receiverId);

    void deleteBySenderIdOrReceiverId(Long senderId, Long receiverId);
}
