package com.example.fanpagebackend.modules.admin.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminDashboardStatsResponse {
    private long totalUsers;
    private long totalStaff;
    private long totalSuperAdmins;
    private long totalRoles;
    private long totalPosts;
    private long totalComments;
    private long totalLikes;
    private long pendingPosts;
    private long hiddenPosts;
    private long pendingReports;
    private long resolvedReports;
}
