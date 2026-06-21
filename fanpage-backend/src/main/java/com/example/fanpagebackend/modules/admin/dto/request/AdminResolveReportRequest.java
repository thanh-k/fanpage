package com.example.fanpagebackend.modules.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminResolveReportRequest {
    @NotBlank(message = "Trạng thái xử lý không được trống")
    private String status;
    private String adminNote;
}
