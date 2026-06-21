package com.example.fanpagebackend.modules.accountdeletion.repository;

import com.example.fanpagebackend.common.AccountDeletionRequestStatus;
import com.example.fanpagebackend.modules.accountdeletion.entity.AccountDeletionRequest;
import com.example.fanpagebackend.modules.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AccountDeletionRequestRepository extends JpaRepository<AccountDeletionRequest, Long> {

    boolean existsByUserAndStatus(User user, AccountDeletionRequestStatus status);

    Optional<AccountDeletionRequest> findFirstByUserOrderByCreatedAtDesc(User user);

    @EntityGraph(attributePaths = {"user", "processedBy"})
    Page<AccountDeletionRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @EntityGraph(attributePaths = {"user", "processedBy"})
    Page<AccountDeletionRequest> findByStatusOrderByCreatedAtDesc(AccountDeletionRequestStatus status, Pageable pageable);
}
