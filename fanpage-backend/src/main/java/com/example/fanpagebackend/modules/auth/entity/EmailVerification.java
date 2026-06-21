package com.example.fanpagebackend.modules.auth.entity;

import com.example.fanpagebackend.common.VerificationPurpose;
import com.example.fanpagebackend.common.Gender;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import com.example.fanpagebackend.common.BaseEntity;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "email_verifications", indexes = {
        @Index(name = "idx_email_verifications_email", columnList = "email"),
        @Index(name = "idx_email_verifications_code", columnList = "code"),
        @Index(name = "idx_email_verifications_purpose", columnList = "purpose")
})
public class EmailVerification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String email;

    @Column(nullable = false, length = 6)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private VerificationPurpose purpose;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @Column(name = "pending_username", length = 50)
    private String pendingUsername;

    @Column(name = "pending_password_hash", length = 255)
    private String pendingPasswordHash;

    @Column(name = "pending_full_name", length = 100)
    private String pendingFullName;

    @Enumerated(EnumType.STRING)
    @Column(name = "pending_gender", length = 20)
    private Gender pendingGender;

    public boolean isUsed() {
        return usedAt != null;
    }
}
