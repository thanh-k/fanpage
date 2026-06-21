package com.example.fanpagebackend.modules.admin.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminReportResponse {
    private Long id;
    private String targetType;
    private Long targetId;
    private String reason;
    private String details;
    private String status;
    private Long reporterId;
    private String reporterName;
    private String reporterUsername;
    private String targetPreview;
    private String handledByName;
    private String adminNote;
    private LocalDateTime createdAt;
    private LocalDateTime handledAt;
}
