package com.example.fanpagebackend.modules.report.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateReportRequest {

    @NotBlank(message = "Loại nội dung tố cáo không được trống")
    private String targetType;

    @NotNull(message = "ID nội dung tố cáo không được trống")
    private Long targetId;

    @NotBlank(message = "Hành vi vi phạm không được trống")
    private String violationType; // Gửi chuỗi Enum (ví dụ: SPAM, HATE_SPEECH) từ Frontend lên

    private String details; // Mô tả chi tiết tự điền
}