package com.example.fanpagebackend.modules.chat.document;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "chat_messages")
@CompoundIndex(name = "idx_conversation_created_at", def = "{'conversationId': 1, 'createdAt': -1}")
public class ChatMessageDocument {
    @Id
    private String id;

    @Indexed
    private String conversationId;

    @Indexed
    private Long senderId;

    @Indexed
    private Long receiverId;

    private String content;

    @Builder.Default
    private String type = "TEXT";

    @Builder.Default
    private boolean read = false;

    private LocalDateTime readAt;

    @Builder.Default
    private boolean revoked = false;

    private LocalDateTime revokedAt;

    @CreatedDate
    private LocalDateTime createdAt;
}
