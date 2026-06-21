package com.example.fanpagebackend.modules.report.repository;

import com.example.fanpagebackend.common.ReportStatus;
import com.example.fanpagebackend.common.ReportTargetType;
import com.example.fanpagebackend.modules.report.entity.ContentReport;
import com.example.fanpagebackend.modules.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ContentReportRepository extends JpaRepository<ContentReport, Long> {

    List<ContentReport> findAllByOrderByCreatedAtDesc();

    Page<ContentReport> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByStatus(ReportStatus status);

    long countByReporterAndTargetTypeAndTargetIdAndStatus(
            User reporter,
            ReportTargetType targetType,
            Long targetId,
            ReportStatus status
    );

    @Modifying
    @Query("delete from ContentReport r where r.reporter = :user or r.handledBy = :user")
    void deleteAllByUser(@Param("user") com.example.fanpagebackend.modules.user.entity.User user);
}
