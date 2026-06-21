package com.example.fanpagebackend.modules.admin.service;

import com.example.fanpagebackend.modules.auth.dto.request.*;
import com.example.fanpagebackend.modules.user.dto.request.*;
import com.example.fanpagebackend.modules.post.dto.request.*;
import com.example.fanpagebackend.modules.comment.dto.request.*;
import com.example.fanpagebackend.modules.chat.dto.request.*;
import com.example.fanpagebackend.modules.admin.dto.request.*;
import com.example.fanpagebackend.modules.report.dto.request.*;
import com.example.fanpagebackend.modules.auth.dto.response.*;
import com.example.fanpagebackend.modules.user.dto.response.*;
import com.example.fanpagebackend.modules.post.dto.response.*;
import com.example.fanpagebackend.modules.comment.dto.response.*;
import com.example.fanpagebackend.modules.like.dto.response.*;
import com.example.fanpagebackend.modules.friend.dto.response.*;
import com.example.fanpagebackend.modules.chat.dto.response.*;
import com.example.fanpagebackend.modules.admin.dto.response.*;
import com.example.fanpagebackend.common.dto.response.*;


import java.util.List;
import com.example.fanpagebackend.common.PageResponse;
import com.example.fanpagebackend.modules.admin.dto.request.AdminAssignStaffRoleRequest;
import com.example.fanpagebackend.modules.admin.dto.request.AdminCreateRoleRequest;
import com.example.fanpagebackend.modules.admin.dto.request.AdminResolveReportRequest;
import com.example.fanpagebackend.modules.admin.dto.request.AdminUpdateRoleRequest;
import com.example.fanpagebackend.modules.admin.dto.response.AdminCommentResponse;
import com.example.fanpagebackend.modules.admin.dto.response.AdminDashboardStatsResponse;
import com.example.fanpagebackend.modules.admin.dto.response.AdminPermissionResponse;
import com.example.fanpagebackend.modules.admin.dto.response.AdminPostResponse;
import com.example.fanpagebackend.modules.admin.dto.response.AdminReportResponse;
import com.example.fanpagebackend.modules.admin.dto.response.AdminRoleResponse;
import com.example.fanpagebackend.modules.admin.dto.response.AdminUserResponse;
import com.example.fanpagebackend.modules.accountdeletion.dto.response.AccountDeletionRequestResponse;


public interface AdminService {
    AdminDashboardStatsResponse getDashboardStats();
    PageResponse<AdminUserResponse> getUsers(int page, int size);
    PageResponse<AdminUserResponse> getStaff(int page, int size);
    AdminUserResponse changeUserRole(Long userId, String role);
    AdminUserResponse assignStaffRole(Long userId, AdminAssignStaffRoleRequest request);
    AdminUserResponse removeStaff(Long userId);
    AdminUserResponse lockUser(Long userId, AdminLockUserRequest request);
    AdminUserResponse unlockUser(Long userId);
    PageResponse<AccountDeletionRequestResponse> getAccountDeletionRequests(String status, int page, int size);
    AccountDeletionRequestResponse approveAccountDeletionRequest(Long requestId);
    AccountDeletionRequestResponse rejectAccountDeletionRequest(Long requestId, String adminNote);
    List<AdminPermissionResponse> getPermissions();
    PageResponse<AdminRoleResponse> getRoles(int page, int size);
    AdminRoleResponse createRole(AdminCreateRoleRequest request);
    AdminRoleResponse updateRole(Long roleId, AdminUpdateRoleRequest request);
    void deleteRole(Long roleId);
    PageResponse<AdminPostResponse> getPosts(int page, int size);
    AdminPostResponse updatePostStatus(Long postId, String status);
    void deletePost(Long postId);
    PageResponse<AdminCommentResponse> getComments(int page, int size);
    void deleteComment(Long commentId);
    PageResponse<AdminReportResponse> getReports(int page, int size);
    
    
    AdminReportResponse resolveReportWithAction(Long reportId, String action);
}
