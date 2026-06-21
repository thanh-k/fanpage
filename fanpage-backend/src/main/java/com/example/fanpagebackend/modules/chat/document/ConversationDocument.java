package com.example.fanpagebackend.modules.chat.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "conversations")
public class ConversationDocument {
    @Id
    private String id;

    @Indexed
    private List<Long> participantIds;

    private String lastMessage;
    private Long lastSenderId;
    private LocalDateTime lastMessageAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
