package com.example.fanpagebackend.modules.report.entity;

import com.example.fanpagebackend.common.BaseEntity;
import com.example.fanpagebackend.common.ReportStatus;
import com.example.fanpagebackend.common.ReportTargetType;
import com.example.fanpagebackend.common.ViolationType;
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
@Table(name = "content_reports", indexes = {
        @Index(name = "idx_reports_status", columnList = "status"),
        @Index(name = "idx_reports_target", columnList = "target_type,target_id"),
        @Index(name = "idx_reports_reporter", columnList = "reporter_id")
})
public class ContentReport extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 20)
    private ReportTargetType targetType;

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @Enumerated(EnumType.STRING)
    @Column(name = "violation_type", nullable = false, length = 50)
    private ViolationType violationType; // Thay thế cho việc gõ text tự do thô sơ cũ

    @Column(nullable = false, length = 150)
    private String reason; // Tiêu đề hiển thị của ViolationType hoặc text nếu chọn OTHER

    @Column(columnDefinition = "TEXT")
    private String details;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReportStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "handled_by_id")
    private User handledBy;

    @Column(name = "admin_note", length = 500)
    private String adminNote;

    @Column(name = "handled_at")
    private LocalDateTime handledAt;
}