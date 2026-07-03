package com.example.fanpagebackend.modules.chat.repository.mongo;

import com.example.fanpagebackend.modules.chat.document.ConversationDocument;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ConversationMongoRepository extends MongoRepository<ConversationDocument, String> {
    List<ConversationDocument> findByParticipantIdsContainingOrderByLastMessageAtDesc(Long userId);
    List<ConversationDocument> findByParticipantIdsContainingOrderByLastMessageAtDesc(Long userId, Pageable pageable);

    void deleteByParticipantIdsContaining(Long userId);
}
