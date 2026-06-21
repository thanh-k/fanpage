package com.example.fanpagebackend.modules.chat.entity;

import jakarta.persistence.*;
import lombok.*;
import com.example.fanpagebackend.common.BaseEntity;
import com.example.fanpagebackend.modules.user.entity.User;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "chat_messages",
        indexes = {
                @Index(name = "idx_chat_sender_receiver", columnList = "sender_id,receiver_id"),
                @Index(name = "idx_chat_created_at", columnList = "created_at")
        })
public class ChatMessage extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean read = false;
}
