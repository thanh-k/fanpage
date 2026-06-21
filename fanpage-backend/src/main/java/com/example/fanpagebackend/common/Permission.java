package com.example.fanpagebackend.common;

public enum Permission {
    DASHBOARD_VIEW("Xem tổng quan quản trị"),
    USER_VIEW("Xem danh sách người dùng"),
    STAFF_VIEW("Xem danh sách nhân sự"),
    ROLE_MANAGE("Tạo/sửa role và gán quyền cho nhân sự"),
    POST_VIEW("Xem danh sách bài viết"),
    POST_MODERATE("Duyệt/ẩn bài viết"),
    POST_DELETE("Xóa bài viết"),
    COMMENT_VIEW("Xem danh sách bình luận"),
    COMMENT_DELETE("Xóa bình luận spam"),
    REPORT_VIEW("Xem danh sách tố cáo"),
    REPORT_RESOLVE("Xử lý tố cáo");

    private final String label;

    Permission(String label) { this.label = label; }
    public String getLabel() { return label; }
}
