package com.example.fanpagebackend.modules.admin.controller;

import com.example.fanpagebackend.common.ApiResponse;
import com.example.fanpagebackend.common.PageResponse;
import com.example.fanpagebackend.modules.admin.dto.request.*;
import com.example.fanpagebackend.modules.admin.dto.response.*;
import com.example.fanpagebackend.modules.accountdeletion.dto.request.AdminRejectAccountDeletionRequest;
import com.example.fanpagebackend.modules.accountdeletion.dto.response.AccountDeletionRequestResponse;
import com.example.fanpagebackend.modules.admin.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;

    // --- DASHBOARD ---
    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'DASHBOARD_VIEW')")
    public ApiResponse<AdminDashboardStatsResponse> getStats() { 
        return ApiResponse.success("Lấy thống kê quản trị thành công", adminService.getDashboardStats()); 
    }

    // --- USERS & STAFF ---
    @GetMapping("/users")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'USER_VIEW')")
    public ApiResponse<PageResponse<AdminUserResponse>> getUsers(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) { 
        return ApiResponse.success("Lấy danh sách người dùng thành công", adminService.getUsers(page, size)); 
    }

    @GetMapping("/staff")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'STAFF_VIEW')")
    public ApiResponse<PageResponse<AdminUserResponse>> getStaff(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) { 
        return ApiResponse.success("Lấy danh sách nhân sự thành công", adminService.getStaff(page, size)); 
    }

    // Các hàm cấu hình Role / User cấp cao (Chỉ dành riêng cho Super Admin)
    @PatchMapping("/users/{userId}/role")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ApiResponse<AdminUserResponse> changeRole(@PathVariable("userId") Long userId, @Valid @RequestBody AdminChangeRoleRequest request) { 
        return ApiResponse.success("Cập nhật phân quyền thành công", adminService.changeUserRole(userId, request.getRole())); 
    }



    @PatchMapping("/users/{userId}/lock")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'USER_VIEW')")
    public ApiResponse<AdminUserResponse> lockUser(@PathVariable("userId") Long userId, @RequestBody AdminLockUserRequest request) {
        return ApiResponse.success("Khóa tài khoản thành công", adminService.lockUser(userId, request));
    }

    @PatchMapping("/users/{userId}/unlock")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'USER_VIEW')")
    public ApiResponse<AdminUserResponse> unlockUser(@PathVariable("userId") Long userId) {
        return ApiResponse.success("Mở khóa tài khoản thành công", adminService.unlockUser(userId));
    }

    @GetMapping("/account-deletion-requests")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'USER_VIEW')")
    public ApiResponse<PageResponse<AccountDeletionRequestResponse>> getAccountDeletionRequests(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Lấy danh sách yêu cầu hủy tài khoản thành công", adminService.getAccountDeletionRequests(status, page, size));
    }

    @PatchMapping("/account-deletion-requests/{requestId}/approve")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ApiResponse<AccountDeletionRequestResponse> approveAccountDeletionRequest(@PathVariable("requestId") Long requestId) {
        return ApiResponse.success("Đã duyệt và xóa tài khoản", adminService.approveAccountDeletionRequest(requestId));
    }

    @PatchMapping("/account-deletion-requests/{requestId}/reject")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ApiResponse<AccountDeletionRequestResponse> rejectAccountDeletionRequest(
            @PathVariable("requestId") Long requestId,
            @RequestBody(required = false) AdminRejectAccountDeletionRequest request) {
        return ApiResponse.success("Đã từ chối yêu cầu hủy tài khoản", adminService.rejectAccountDeletionRequest(requestId, request == null ? null : request.getAdminNote()));
    }

    @PatchMapping("/staff/{userId}/staff-role")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ApiResponse<AdminUserResponse> assignStaffRole(@PathVariable("userId") Long userId, @RequestBody AdminAssignStaffRoleRequest request) { 
        return ApiResponse.success("Gán role nhân sự thành công", adminService.assignStaffRole(userId, request)); 
    }

    @DeleteMapping("/staff/{userId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ApiResponse<AdminUserResponse> removeStaff(@PathVariable("userId") Long userId) { 
        return ApiResponse.success("Đã xóa nhân sự thành công", adminService.removeStaff(userId)); 
    }

    // --- QUẢN LÝ QUYỀN (ROLES) ---
    @GetMapping("/permissions")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_MANAGE')")
    public ApiResponse<List<AdminPermissionResponse>> getPermissions() { 
        return ApiResponse.success("Lấy danh sách quyền thành công", adminService.getPermissions()); 
    }

    @GetMapping("/roles")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_MANAGE')")
    public ApiResponse<PageResponse<AdminRoleResponse>> getRoles(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) { 
        return ApiResponse.success("Lấy danh sách role thành công", adminService.getRoles(page, size)); 
    }

    @PostMapping("/roles")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_MANAGE')")
    public ApiResponse<AdminRoleResponse> createRole(@Valid @RequestBody AdminCreateRoleRequest request) { 
        return ApiResponse.success("Tạo role thành công", adminService.createRole(request)); 
    }

    @PutMapping("/roles/{roleId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_MANAGE')")
    public ApiResponse<AdminRoleResponse> updateRole(@PathVariable("roleId") Long roleId, @Valid @RequestBody AdminUpdateRoleRequest request) { 
        return ApiResponse.success("Cập nhật role thành công", adminService.updateRole(roleId, request)); 
    }

    @DeleteMapping("/roles/{roleId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_MANAGE')")
    public ApiResponse<Void> deleteRole(@PathVariable("roleId") Long roleId) { 
        adminService.deleteRole(roleId); 
        return ApiResponse.success("Xóa role thành công", null); 
    }

    // --- QUẢN LÝ BÀI VIẾT (POSTS) ---
    @GetMapping("/posts")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'POST_VIEW', 'POST_MODERATE')")
    public ApiResponse<PageResponse<AdminPostResponse>> getPosts(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) { 
        return ApiResponse.success("Lấy danh sách bài viết thành công", adminService.getPosts(page, size)); 
    }

    @PatchMapping("/posts/{postId}/status")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'POST_MODERATE')")
    public ApiResponse<AdminPostResponse> updatePostStatus(@PathVariable("postId") Long postId, @RequestBody Map<String, String> request) { 
        return ApiResponse.success("Cập nhật trạng thái bài viết thành công", adminService.updatePostStatus(postId, request.get("status"))); 
    }

    @DeleteMapping("/posts/{postId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'POST_DELETE')")
    public ApiResponse<Void> deletePost(@PathVariable("postId") Long postId) { 
        adminService.deletePost(postId); 
        return ApiResponse.success("Xóa bài viết thành công", null); 
    }

    // --- QUẢN LÝ BÌNH LUẬN (COMMENTS) ---
    @GetMapping("/comments")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'COMMENT_VIEW')")
    public ApiResponse<PageResponse<AdminCommentResponse>> getComments(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) { 
        return ApiResponse.success("Lấy danh sách bình luận thành công", adminService.getComments(page, size)); 
    }

    @DeleteMapping("/comments/{commentId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'COMMENT_DELETE')")
    public ApiResponse<Void> deleteComment(@PathVariable("commentId") Long commentId) { 
        adminService.deleteComment(commentId); 
        return ApiResponse.success("Xóa bình luận thành công", null); 
    }

    // --- QUẢN LÝ TỐ CÁO (REPORTS) ---
    @GetMapping("/reports")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'REPORT_VIEW')")
    public ApiResponse<PageResponse<AdminReportResponse>> getReports(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) { 
        return ApiResponse.success("Lấy danh sách tố cáo thành công", adminService.getReports(page, size)); 
    }

    @PatchMapping("/reports/{reportId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'REPORT_RESOLVE')")
    public ApiResponse<AdminReportResponse> resolveReport(
            @PathVariable("reportId") Long reportId, 
            @RequestBody Map<String, String> payload) {
        
        String action = payload.get("action"); // APPROVE hoặc REJECT
        return ApiResponse.success("Cập nhật quyết định xử lý tố cáo thành công", 
                adminService.resolveReportWithAction(reportId, action));
    }
}