package com.example.fanpagebackend.modules.accountdeletion.entity;

import com.example.fanpagebackend.common.AccountDeletionRequestStatus;
import com.example.fanpagebackend.common.BaseEntity;
import com.example.fanpagebackend.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "account_deletion_requests", indexes = {
        @Index(name = "idx_account_deletion_status", columnList = "status"),
        @Index(name = "idx_account_deletion_user", columnList = "user_id")
})
public class AccountDeletionRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AccountDeletionRequestStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by_id")
    private User processedBy;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "admin_note", length = 500)
    private String adminNote;
}
