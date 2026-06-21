package com.example.fanpagebackend.modules.accountdeletion.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AccountDeletionRequestResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String username;
    private String email;
    private String avatar;
    private String reason;
    private String status;
    private String processedByName;
    private LocalDateTime processedAt;
    private String adminNote;
    private LocalDateTime createdAt;
}
