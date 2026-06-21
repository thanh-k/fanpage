package com.example.fanpagebackend.modules.auth.repository;

import com.example.fanpagebackend.common.VerificationPurpose;
import com.example.fanpagebackend.modules.auth.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {

    Optional<EmailVerification> findTopByEmailAndPurposeAndUsedAtIsNullOrderByCreatedAtDesc(
            String email,
            VerificationPurpose purpose
    );

    List<EmailVerification> findByEmailAndPurposeAndUsedAtIsNull(String email, VerificationPurpose purpose);

    void deleteByExpiresAtBefore(LocalDateTime time);
}
