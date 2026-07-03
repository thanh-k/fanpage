package com.example.fanpagebackend.modules.admin.service.impl;

import com.example.fanpagebackend.common.*;
import com.example.fanpagebackend.modules.admin.dto.request.*;
import com.example.fanpagebackend.modules.admin.dto.response.*;
import com.example.fanpagebackend.modules.user.entity.User;
import com.example.fanpagebackend.modules.post.entity.Post;
import com.example.fanpagebackend.modules.comment.entity.Comment;
import com.example.fanpagebackend.modules.admin.entity.StaffRole;
import com.example.fanpagebackend.modules.report.entity.ContentReport;
import com.example.fanpagebackend.exception.BadRequestException;
import com.example.fanpagebackend.exception.ForbiddenException;
import com.example.fanpagebackend.exception.NotFoundException;
import com.example.fanpagebackend.modules.user.repository.UserRepository;
import com.example.fanpagebackend.modules.post.repository.PostRepository;
import com.example.fanpagebackend.modules.comment.repository.CommentRepository;
import com.example.fanpagebackend.modules.report.repository.ContentReportRepository;
import com.example.fanpagebackend.modules.admin.repository.StaffRoleRepository;
import com.example.fanpagebackend.modules.like.repository.PostLikeRepository;
import com.example.fanpagebackend.modules.admin.service.AdminService;
import com.example.fanpagebackend.modules.notification.service.NotificationService; // IMPORT SERVICE THÔNG BÁO MỚI
import com.example.fanpagebackend.modules.accountdeletion.dto.response.AccountDeletionRequestResponse;
import com.example.fanpagebackend.modules.accountdeletion.entity.AccountDeletionRequest;
import com.example.fanpagebackend.modules.accountdeletion.repository.AccountDeletionRequestRepository;
import com.example.fanpagebackend.modules.chat.repository.ChatMessageRepository;
import com.example.fanpagebackend.modules.chat.repository.mongo.ChatMessageMongoRepository;
import com.example.fanpagebackend.modules.chat.repository.mongo.ConversationMongoRepository;
import com.example.fanpagebackend.modules.friend.repository.FriendRequestRepository;
import com.example.fanpagebackend.modules.notification.repository.NotificationRepository;
import com.example.fanpagebackend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final StaffRoleRepository staffRoleRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final PostLikeRepository postLikeRepository;
    private final ContentReportRepository contentReportRepository;
    private final SecurityUtil securityUtil;
    
    // TIÊM THÊM SERVICE THÔNG BÁO REALTIME MONGODB CHUẨN XÁC
    private final NotificationService notificationService;

    private final AccountDeletionRequestRepository accountDeletionRequestRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatMessageMongoRepository chatMessageMongoRepository;
    private final ConversationMongoRepository conversationMongoRepository;
    private final NotificationRepository notificationRepository;

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardStatsResponse getDashboardStats() {
        requirePermission(Permission.DASHBOARD_VIEW);
        return AdminDashboardStatsResponse.builder()
                .totalUsers(userRepository.countByRole(Role.USER))
                .totalStaff(userRepository.countByRole(Role.STAFF))
                .totalSuperAdmins(userRepository.countByRole(Role.SUPER_ADMIN))
                .totalRoles(staffRoleRepository.countByActiveTrue())
                .totalPosts(postRepository.count())
                .totalComments(commentRepository.count())
                .totalLikes(postLikeRepository.count())
                .pendingPosts(postRepository.countByStatus(PostStatus.PENDING))
                .hiddenPosts(postRepository.countByStatus(PostStatus.HIDDEN))
                .pendingReports(contentReportRepository.countByStatus(ReportStatus.PENDING))
                .resolvedReports(contentReportRepository.countByStatus(ReportStatus.RESOLVED))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AdminUserResponse> getUsers(int page, int size) {
        requirePermission(Permission.USER_VIEW);
        Page<User> users = userRepository.findByRoleOrderByJoinedAtDesc(Role.USER, adminPageable(page, size));
        return toPageResponse(users, this::toAdminUserResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AdminUserResponse> getStaff(int page, int size) {
        requirePermission(Permission.STAFF_VIEW);
        Page<User> staff = userRepository.findByRoleInOrderByJoinedAtDesc(List.of(Role.STAFF, Role.SUPER_ADMIN), adminPageable(page, size));
        return toPageResponse(staff, this::toAdminUserResponse);
    }

    @Override
    @Transactional
    public AdminUserResponse changeUserRole(Long userId, String roleValue) {
        requireSuperAdmin();
        User currentUser = securityUtil.getCurrentUser();
        User target = getUser(userId);
        if (target.getId().equals(currentUser.getId())) throw new BadRequestException("Không thể tự đổi quyền của chính mình");
        Role role = parseRole(roleValue);
        target.setRole(role);
        if (role != Role.STAFF) target.setStaffRole(null);
        return toAdminUserResponse(userRepository.save(target));
    }

    @Override
    @Transactional
    public AdminUserResponse assignStaffRole(Long userId, AdminAssignStaffRoleRequest request) {
        requireSuperAdmin();
        User currentUser = securityUtil.getCurrentUser();
        User target = getUser(userId);
        if (target.getId().equals(currentUser.getId())) throw new BadRequestException("Không thể tự gán role cho chính mình");
        if (request.getRoleId() == null) {
            target.setRole(Role.USER);
            target.setStaffRole(null);
        } else {
            StaffRole role = staffRoleRepository.findById(request.getRoleId()).orElseThrow(() -> new NotFoundException("Không tìm thấy role nhân sự"));
            if (!role.isActive()) throw new BadRequestException("Role này đang bị tắt");
            target.setRole(Role.STAFF);
            target.setStaffRole(role);
        }
        return toAdminUserResponse(userRepository.save(target));
    }

    @Override
    @Transactional
    public AdminUserResponse removeStaff(Long userId) {
        requireSuperAdmin();
        User currentUser = securityUtil.getCurrentUser();
        User target = getUser(userId);
        if (target.getId().equals(currentUser.getId())) throw new BadRequestException("Không thể tự xóa quyền nhân sự của chính mình");
        if (target.getRole() == Role.SUPER_ADMIN) throw new BadRequestException("Không thể xóa Super Admin khỏi danh sách nhân sự");
        target.setRole(Role.USER);
        target.setStaffRole(null);
        return toAdminUserResponse(userRepository.save(target));
    }



    @Override
    @Transactional
    public AdminUserResponse lockUser(Long userId, AdminLockUserRequest request) {
        requirePermission(Permission.USER_VIEW);
        User currentUser = securityUtil.getCurrentUser();
        User target = getUser(userId);
        if (target.getId().equals(currentUser.getId())) {
            throw new BadRequestException("Không thể tự khóa chính mình");
        }
        if (target.getRole() == Role.SUPER_ADMIN) {
            throw new BadRequestException("Không thể khóa Super Admin");
        }
        UserLockDuration duration = parseLockDuration(request == null ? null : request.getDuration());
        target.setLocked(true);
        target.setLockedUntil(duration.resolveUntil());
        target.setLockReason(trim(request == null ? null : request.getReason()));
        if (target.getLockReason() == null || target.getLockReason().isBlank()) {
            target.setLockReason("Tài khoản bị khóa trong " + duration.getLabel());
        }
        return toAdminUserResponse(userRepository.save(target));
    }

    @Override
    @Transactional
    public AdminUserResponse unlockUser(Long userId) {
        requirePermission(Permission.USER_VIEW);
        User target = getUser(userId);
        target.setLocked(false);
        target.setLockedUntil(null);
        target.setLockReason(null);
        return toAdminUserResponse(userRepository.save(target));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AccountDeletionRequestResponse> getAccountDeletionRequests(String status, int page, int size) {
        requirePermission(Permission.USER_VIEW);
        Pageable pageable = adminPageable(page, size);
        Page<AccountDeletionRequest> requests;
        if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) {
            requests = accountDeletionRequestRepository.findAllByOrderByCreatedAtDesc(pageable);
        } else {
            requests = accountDeletionRequestRepository.findByStatusOrderByCreatedAtDesc(parseDeletionStatus(status), pageable);
        }
        return toPageResponse(requests, this::toAccountDeletionResponse);
    }

    @Override
    @Transactional
    public AccountDeletionRequestResponse approveAccountDeletionRequest(Long requestId) {
        requireSuperAdmin();
        User admin = securityUtil.getCurrentUser();
        AccountDeletionRequest request = accountDeletionRequestRepository.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy yêu cầu hủy tài khoản"));
        if (request.getStatus() != AccountDeletionRequestStatus.PENDING) {
            throw new BadRequestException("Yêu cầu này đã được xử lý");
        }
        User target = request.getUser();
        if (target.getRole() == Role.SUPER_ADMIN) {
            throw new BadRequestException("Không thể xóa tài khoản Super Admin");
        }
        request.setStatus(AccountDeletionRequestStatus.APPROVED);
        request.setProcessedAt(LocalDateTime.now());
        request.setProcessedBy(admin);
        AccountDeletionRequestResponse response = toAccountDeletionResponse(request);
        accountDeletionRequestRepository.save(request);
        permanentlyDeleteUser(target, request);
        return response;
    }

    @Override
    @Transactional
    public AccountDeletionRequestResponse rejectAccountDeletionRequest(Long requestId, String adminNote) {
        requireSuperAdmin();
        AccountDeletionRequest request = accountDeletionRequestRepository.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy yêu cầu hủy tài khoản"));
        if (request.getStatus() != AccountDeletionRequestStatus.PENDING) {
            throw new BadRequestException("Yêu cầu này đã được xử lý");
        }
        request.setStatus(AccountDeletionRequestStatus.REJECTED);
        request.setProcessedAt(LocalDateTime.now());
        request.setProcessedBy(securityUtil.getCurrentUser());
        request.setAdminNote(trim(adminNote));
        return toAccountDeletionResponse(accountDeletionRequestRepository.save(request));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminPermissionResponse> getPermissions() {
        requireSuperAdmin();
        return Arrays.stream(Permission.values()).map(p -> AdminPermissionResponse.builder().code(p.name()).label(p.getLabel()).build()).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AdminRoleResponse> getRoles(int page, int size) {
        requireSuperAdmin();
        Page<StaffRole> roles = staffRoleRepository.findAll(adminPageable(page, size));
        return toPageResponse(roles, this::toRoleResponse);
    }

    @Override
    @Transactional
    public AdminRoleResponse createRole(AdminCreateRoleRequest request) {
        requireSuperAdmin();
        String name = normalizeName(request.getName());
        if (staffRoleRepository.existsByNameIgnoreCase(name)) throw new BadRequestException("Tên role đã tồn tại");
        StaffRole role = StaffRole.builder()
                .name(name)
                .description(trim(request.getDescription()))
                .active(true)
                .permissions(parsePermissions(request.getPermissions()))
                .build();
        return toRoleResponse(staffRoleRepository.save(role));
    }

    @Override
    @Transactional
    public AdminRoleResponse updateRole(Long roleId, AdminUpdateRoleRequest request) {
        requireSuperAdmin();
        StaffRole role = staffRoleRepository.findById(roleId).orElseThrow(() -> new NotFoundException("Không tìm thấy role"));
        String name = normalizeName(request.getName());
        staffRoleRepository.findByNameIgnoreCase(name).ifPresent(existing -> { if (!existing.getId().equals(roleId)) throw new BadRequestException("Tên role đã tồn tại"); });
        role.setName(name);
        role.setDescription(trim(request.getDescription()));
        role.setActive(request.isActive());
        role.setPermissions(parsePermissions(request.getPermissions()));
        return toRoleResponse(staffRoleRepository.save(role));
    }

    @Override
    @Transactional
    public void deleteRole(Long roleId) {
        requireSuperAdmin();
        StaffRole role = staffRoleRepository.findById(roleId).orElseThrow(() -> new NotFoundException("Không tìm thấy role"));
        if (userRepository.countByStaffRole(role) > 0) throw new BadRequestException("Role đang được gán cho nhân sự, không thể xóa");
        staffRoleRepository.delete(role);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AdminPostResponse> getPosts(int page, int size) {
        requirePermission(Permission.POST_VIEW);
        Page<Post> posts = postRepository.findAllByOrderByCreatedAtDesc(adminPageable(page, size));
        return toPageResponse(posts, this::toAdminPostResponse);
    }

    @Override
    @Transactional
    public AdminPostResponse updatePostStatus(Long postId, String statusValue) {
        requirePermission(Permission.POST_MODERATE);
        Post post = postRepository.findById(postId).orElseThrow(() -> new NotFoundException("Không tìm thấy bài viết"));
        post.setStatus(parsePostStatus(statusValue));
        return toAdminPostResponse(postRepository.save(post));
    }

    @Override
    @Transactional
    public void deletePost(Long postId, String reason) {
        requirePermission(Permission.POST_DELETE);
        String cleanReason = reason == null ? "" : reason.trim();
        if (cleanReason.length() < 5) {
            throw new BadRequestException("Vui lòng nhập lý do xóa bài viết tối thiểu 5 ký tự");
        }

        User currentAdmin = securityUtil.getCurrentUser();
        Post post = postRepository.findById(postId).orElseThrow(() -> new NotFoundException("Không tìm thấy bài viết"));
        User author = post.getAuthor();
        Long deletedPostId = post.getId();
        LocalDateTime postCreatedAt = post.getCreatedAt();
        String postedAtText = postCreatedAt == null
                ? "không rõ thời gian"
                : postCreatedAt.format(DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy"));

        postRepository.delete(post);

        if (author != null) {
            notificationService.createAndSend(
                    author.getId(),
                    currentAdmin == null ? null : currentAdmin.getId(),
                    "Hệ thống quản trị",
                    "POST_DELETED_BY_ADMIN",
                    deletedPostId,
                    "Bài đăng lúc " + postedAtText + " của bạn đã bị admin xóa. Lý do: " + cleanReason,
                    "/notifications"
            );
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AdminCommentResponse> getComments(int page, int size) {
        requirePermission(Permission.COMMENT_VIEW);
        Page<Comment> comments = commentRepository.findAllByOrderByCreatedAtDesc(adminPageable(page, size));
        return toPageResponse(comments, this::toAdminCommentResponse);
    }

    @Override
    @Transactional
    public void deleteComment(Long commentId) {
        requirePermission(Permission.COMMENT_DELETE);
        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new NotFoundException("Không tìm thấy bình luận"));
        commentRepository.delete(comment);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AdminReportResponse> getReports(int page, int size) {
        requirePermission(Permission.REPORT_VIEW);
        Page<ContentReport> reports = contentReportRepository.findAllByOrderByCreatedAtDesc(adminPageable(page, size));
        return toPageResponse(reports, this::toReportResponse);
    }

    // =========================================================================
    // ĐÃ FIX ĐỒNG BỘ: HÀM NGHIỆP VỤ XỬ LÝ THEO ACTION HOÀN CHỈNH
    // =========================================================================
    @Override
    @Transactional
    public AdminReportResponse resolveReportWithAction(Long reportId, String action) {
        requirePermission(Permission.REPORT_RESOLVE);
        
        ContentReport report = contentReportRepository.findById(reportId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đơn tố cáo cần xử lý"));
                
        if (report.getStatus() != ReportStatus.PENDING) {
            throw new BadRequestException("Đơn tố cáo này đã được xử lý từ trước.");
        }

        User currentAdmin = securityUtil.getCurrentUser();
        report.setHandledBy(currentAdmin);
        report.setHandledAt(LocalDateTime.now());

        if ("APPROVE".equalsIgnoreCase(action)) {
            report.setStatus(ReportStatus.RESOLVED);
            report.setAdminNote("Xác minh vi phạm - Hệ thống đã tự động gỡ bỏ nội dung độc hại.");

            // PHÂN LOẠI ĐỂ TIẾN HÀNH XÓA VÀ BẮN THÔNG BÁO REALTIME MONGODB
            if (report.getTargetType() == ReportTargetType.POST) {
                postRepository.findById(report.getTargetId()).ifPresent(post -> {
                    User author = post.getAuthor();
                    if (author != null) {
                        notificationService.createAndSend(
                            author.getId(),
                            currentAdmin.getId(),
                            "Hệ thống quản trị",
                            "POST_DELETED",
                            post.getId(),
                            "Bài viết của bạn chứa nội dung vi phạm nghiêm trọng tiêu chuẩn cộng đồng và đã bị Admin gỡ bỏ.",
                            "/posts/" + post.getId()
                        );
                    }
                    postRepository.delete(post);
                });
            } else if (report.getTargetType() == ReportTargetType.COMMENT) {
                commentRepository.findById(report.getTargetId()).ifPresent(comment -> {
                    User author = comment.getAuthor();
                    if (author != null) {
                        notificationService.createAndSend(
                            author.getId(),
                            currentAdmin.getId(),
                            "Hệ thống quản trị",
                            "COMMENT_DELETED",
                            comment.getPost().getId(),
                            "Bình luận của bạn đã bị gỡ bỏ do vi phạm quy chuẩn nội dung tiêu chuẩn cộng đồng.",
                            "/posts/" + comment.getPost().getId()
                        );
                    }
                    commentRepository.delete(comment);
                });
            }
        } else if ("REJECT".equalsIgnoreCase(action)) {
            report.setStatus(ReportStatus.RESOLVED);
            report.setAdminNote("Lưu hồ sơ - Chưa đủ cơ sở xác thực hành vi vi phạm tiêu chuẩn cộng đồng.");
        } else {
            throw new BadRequestException("Hành động xử lý đơn tố cáo không hợp lệ (Chỉ nhận APPROVE hoặc REJECT)");
        }

        return toReportResponse(contentReportRepository.save(report));
    }

    private Pageable adminPageable(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = size <= 0 ? 10 : Math.min(size, 100);
        return PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    private <E, R> PageResponse<R> toPageResponse(Page<E> page, java.util.function.Function<E, R> mapper) {
        return PageResponse.<R>builder()
                .items(page.getContent().stream().map(mapper).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalItems(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .hasMore(page.hasNext())
                .build();
    }


    private UserLockDuration parseLockDuration(String value) {
        if (value == null || value.isBlank()) {
            return UserLockDuration.THIRTY_MINUTES;
        }
        try {
            return UserLockDuration.valueOf(value.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException("Thời gian khóa không hợp lệ");
        }
    }

    private AccountDeletionRequestStatus parseDeletionStatus(String value) {
        try {
            return AccountDeletionRequestStatus.valueOf(value.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException("Trạng thái yêu cầu hủy tài khoản không hợp lệ");
        }
    }

    private void permanentlyDeleteUser(User target, AccountDeletionRequest approvedRequest) {
        Long targetId = target.getId();
        notificationRepository.deleteByRecipientIdOrSenderId(targetId, targetId);
        chatMessageMongoRepository.deleteBySenderIdOrReceiverId(targetId, targetId);
        conversationMongoRepository.deleteByParticipantIdsContaining(targetId);
        postLikeRepository.deleteByUser(target);
        commentRepository.deleteByAuthor(target);
        friendRequestRepository.deleteAllByUser(target);
        contentReportRepository.deleteAllByUser(target);
        chatMessageRepository.deleteAllByUser(target);
        List<Post> targetPosts = postRepository.findAllByAuthor(target);
        postRepository.deleteAll(targetPosts);
        accountDeletionRequestRepository.delete(approvedRequest);
        userRepository.delete(target);
    }

    private boolean isUserLocked(User user) {
        return user.isLocked() && user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now());
    }

    private AccountDeletionRequestResponse toAccountDeletionResponse(AccountDeletionRequest request) {
        User user = request.getUser();
        User processedBy = request.getProcessedBy();
        return AccountDeletionRequestResponse.builder()
                .id(request.getId())
                .userId(user == null ? null : user.getId())
                .userName(user == null ? "Tài khoản đã xóa" : user.getFullName())
                .username(user == null ? null : user.getUsername())
                .email(user == null ? null : user.getEmail())
                .avatar(user == null ? null : user.getAvatar())
                .reason(request.getReason())
                .status(request.getStatus().name())
                .processedByName(processedBy == null ? null : processedBy.getFullName())
                .processedAt(request.getProcessedAt())
                .adminNote(request.getAdminNote())
                .createdAt(request.getCreatedAt())
                .build();
    }

    private void requireSuperAdmin() {
        if (securityUtil.getCurrentUser().getRole() != Role.SUPER_ADMIN) throw new ForbiddenException("Chỉ Super Admin được thực hiện chức năng này");
    }

    private void requirePermission(Permission permission) {
        User user = securityUtil.getCurrentUser();
        if (user.getRole() == Role.SUPER_ADMIN) return;
        if (user.getRole() != Role.STAFF || user.getStaffRole() == null || !user.getStaffRole().isActive() || !user.getStaffRole().getPermissions().contains(permission)) {
            throw new ForbiddenException("Bạn không có quyền: " + permission.getLabel());
        }
    }

    private User getUser(Long id) { return userRepository.findById(id).orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng")); }
    private String normalizeName(String v) { String s = trim(v); if (s == null || s.isBlank()) throw new BadRequestException("Tên role không được trống"); return s; }
    private String trim(String v) { return v == null ? null : v.trim(); }

    private Set<Permission> parsePermissions(Set<String> values) {
        if (values == null || values.isEmpty()) throw new BadRequestException("Role phải có ít nhất một quyền");
        return values.stream().map(v -> { try { return Permission.valueOf(v.trim().toUpperCase()); } catch (Exception e) { throw new BadRequestException("Quyền không hợp lệ: " + v); } }).collect(Collectors.toCollection(LinkedHashSet::new));
    }
    private Role parseRole(String value) { try { return Role.valueOf(value.trim().toUpperCase()); } catch (Exception ex) { throw new BadRequestException("Vai trò không hợp lệ"); } }
    private PostStatus parsePostStatus(String value) { try { return PostStatus.valueOf(value.trim().toUpperCase()); } catch (Exception ex) { throw new BadRequestException("Trạng thái bài viết không hợp lệ"); } }

    private AdminRoleResponse toRoleResponse(StaffRole role) {
        return AdminRoleResponse.builder().id(role.getId()).name(role.getName()).description(role.getDescription()).active(role.isActive()).permissions(role.getPermissions().stream().map(Enum::name).collect(Collectors.toCollection(LinkedHashSet::new))).staffCount((int) userRepository.countByStaffRole(role)).createdAt(role.getCreatedAt()).updatedAt(role.getUpdatedAt()).build();
    }

    private AdminUserResponse toAdminUserResponse(User user) {
        StaffRole staffRole = user.getStaffRole();
        Set<String> permissions = user.getRole() == Role.SUPER_ADMIN ? Set.of("SUPER_ADMIN") : staffRole == null ? Set.of() : staffRole.getPermissions().stream().map(Enum::name).collect(Collectors.toSet());
        return AdminUserResponse.builder().id(user.getId()).name(user.getFullName()).username(user.getUsername()).email(user.getEmail()).avatar(user.getAvatar()).gender(user.getGender() == null ? "PRIVATE" : user.getGender().name()).role(user.getRole().name()).staffRoleId(staffRole == null ? null : staffRole.getId()).staffRoleName(staffRole == null ? null : staffRole.getName()).permissions(permissions).provider(user.getProvider()).emailVerified(user.isEmailVerified()).locked(isUserLocked(user)).lockedUntil(user.getLockedUntil()).lockReason(user.getLockReason()).joinedAt(user.getJoinedAt()).postCount(user.getPosts() == null ? 0 : user.getPosts().size()).publicPostCount(postRepository.countByAuthorAndAnonymousFalse(user)).build();
    }

    private AdminPostResponse toAdminPostResponse(Post post) {
        User author = post.getAuthor();
        return AdminPostResponse.builder().id(post.getId()).content(post.getContent()).anonymous(post.isAnonymous()).status(post.getStatus().name()).createdAt(post.getCreatedAt()).updatedAt(post.getUpdatedAt()).authorId(author.getId()).authorName(author.getFullName()).authorUsername(author.getUsername()).authorEmail(author.getEmail()).likesCount(postLikeRepository.countByPost(post)).commentCount(commentRepository.countByPost(post)).build();
    }
    private AdminCommentResponse toAdminCommentResponse(Comment comment) {
        User author = comment.getAuthor(); String postContent = comment.getPost().getContent(); String preview = postContent == null ? "" : (postContent.length() > 80 ? postContent.substring(0,80)+"..." : postContent);
        return AdminCommentResponse.builder().id(comment.getId()).postId(comment.getPost().getId()).content(comment.getContent()).createdAt(comment.getCreatedAt()).updatedAt(comment.getUpdatedAt()).authorId(author.getId()).authorName(author.getFullName()).authorUsername(author.getUsername()).authorEmail(author.getEmail()).postContentPreview(preview).build();
    }
    private AdminReportResponse toReportResponse(ContentReport report) {
        User reporter = report.getReporter(); User handledBy = report.getHandledBy();
        return AdminReportResponse.builder().id(report.getId()).targetType(report.getTargetType().name()).targetId(report.getTargetId()).reason(report.getReason()).details(report.getDetails()).status(report.getStatus().name()).reporterId(reporter.getId()).reporterName(reporter.getFullName()).reporterUsername(reporter.getUsername()).targetPreview(resolveTargetPreview(report)).handledByName(handledBy == null ? null : handledBy.getFullName()).adminNote(report.getAdminNote()).createdAt(report.getCreatedAt()).handledAt(report.getHandledAt()).build();
    }
    private String resolveTargetPreview(ContentReport report) {
        try {
            if (report.getTargetType() == ReportTargetType.POST) return postRepository.findById(report.getTargetId()).map(p -> preview(p.getContent())).orElse("Bài viết không tồn tại");
            if (report.getTargetType() == ReportTargetType.COMMENT) return commentRepository.findById(report.getTargetId()).map(c -> preview(c.getContent())).orElse("Bình luận không tồn tại");
            if (report.getTargetType() == ReportTargetType.USER) return userRepository.findById(report.getTargetId()).map(u -> u.getFullName() + " (@" + u.getUsername() + ")").orElse("Người dùng không tồn tại");
        } catch(Exception ignored) {}
        return "";
    }
    private String preview(String text) { return text == null ? "" : text.length() > 120 ? text.substring(0,120)+"..." : text; }
}