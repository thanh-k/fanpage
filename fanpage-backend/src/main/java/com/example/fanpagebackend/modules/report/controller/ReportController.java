package com.example.fanpagebackend.modules.report.controller;

import com.example.fanpagebackend.common.ApiResponse;
import com.example.fanpagebackend.modules.report.dto.request.CreateReportRequest;
import com.example.fanpagebackend.common.dto.response.MessageResponse;
import com.example.fanpagebackend.modules.report.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.example.fanpagebackend.common.ViolationType;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    @GetMapping("/violation-types")
    public ApiResponse<List<Map<String, String>>> getViolationTypes() {
        List<Map<String, String>> items = Arrays.stream(ViolationType.values())
                .map(item -> Map.of(
                        "value", item.name(),
                        "label", item.getLabel()
                ))
                .toList();

        return ApiResponse.success("Danh sách loại tố cáo", items);
    }


    private final ReportService reportService;

    @PostMapping
    public ApiResponse<MessageResponse> createReport(@Valid @RequestBody CreateReportRequest request) {
        return ApiResponse.success("Gửi tố cáo thành công", reportService.createReport(request));
    }
}
