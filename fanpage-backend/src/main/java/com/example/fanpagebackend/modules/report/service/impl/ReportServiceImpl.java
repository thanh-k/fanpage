package com.example.fanpagebackend.modules.report.service.impl;

import com.example.fanpagebackend.common.ReportStatus;
import com.example.fanpagebackend.common.ReportTargetType;
import com.example.fanpagebackend.common.ViolationType;
import com.example.fanpagebackend.modules.report.dto.request.CreateReportRequest;
import com.example.fanpagebackend.common.dto.response.MessageResponse;
import com.example.fanpagebackend.modules.report.entity.ContentReport;
import com.example.fanpagebackend.modules.user.entity.User;
import com.example.fanpagebackend.exception.BadRequestException;
import com.example.fanpagebackend.modules.comment.repository.CommentRepository;
import com.example.fanpagebackend.modules.report.repository.ContentReportRepository;
import com.example.fanpagebackend.modules.post.repository.PostRepository;
import com.example.fanpagebackend.modules.user.repository.UserRepository;
import com.example.fanpagebackend.modules.report.service.ReportService;
import com.example.fanpagebackend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ContentReportRepository contentReportRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final SecurityUtil securityUtil;

    @Override
    @Transactional
    public MessageResponse createReport(CreateReportRequest request) {
        User reporter = securityUtil.getCurrentUser();

        ReportTargetType targetType = parseTargetType(request.getTargetType());
        Long targetId = request.getTargetId();
        validateTargetExists(targetType, targetId);

        ViolationType violationType = parseViolationType(request.getViolationType());

        long pendingCount = contentReportRepository
                .countByReporterAndTargetTypeAndTargetIdAndStatus(
                        reporter,
                        targetType,
                        targetId,
                        ReportStatus.PENDING
                );

        if (pendingCount > 0) {
            throw new BadRequestException("Bạn đã gửi đơn tố cáo cho nội dung này, vui lòng chờ nhân sự phản hồi.");
        }

        ContentReport report = ContentReport.builder()
                .reporter(reporter)
                .targetType(targetType)
                .targetId(targetId)
                .violationType(violationType)
                .reason(violationType.getLabel()) // Lấy nhãn tiếng Việt lưu trực tiếp làm lý do chính
                .details(request.getDetails() != null ? request.getDetails().trim() : "")
                .status(ReportStatus.PENDING)
                .build();

        contentReportRepository.save(report);

        return MessageResponse.builder()
                .value("Hệ thống đã ghi nhận tố cáo thành công.")
                .build();
    }

    private void validateTargetExists(ReportTargetType targetType, Long targetId) {
        if (targetId == null) throw new BadRequestException("ID nội dung cần tố cáo không hợp lệ");
        switch (targetType) {
            case POST -> { if (!postRepository.existsById(targetId)) throw new BadRequestException("Bài viết không tồn tại hoặc đã bị xóa trước đó"); }
            case COMMENT -> { if (!commentRepository.existsById(targetId)) throw new BadRequestException("Bình luận không tồn tại hoặc đã bị xóa trước đó"); }
            case USER -> { if (!userRepository.existsById(targetId)) throw new BadRequestException("Tài khoản người dùng không tồn tại"); }
            default -> throw new BadRequestException("Loại đích tố cáo không hợp lệ");
        }
    }

    private ReportTargetType parseTargetType(String value) {
        try { return ReportTargetType.valueOf(value.trim().toUpperCase()); } 
        catch (Exception e) { throw new BadRequestException("Loại dữ liệu tố cáo targetType không đúng quy định"); }
    }

    private ViolationType parseViolationType(String value) {
        try { return ViolationType.valueOf(value.trim().toUpperCase()); } 
        catch (Exception e) { throw new BadRequestException("Hành vi vi phạm lựa chọn không nằm trong danh mục hỗ trợ"); }
    }
}