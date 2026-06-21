package com.example.fanpagebackend.modules.report.service;

import com.example.fanpagebackend.modules.report.dto.request.CreateReportRequest;
import com.example.fanpagebackend.common.dto.response.MessageResponse;

public interface ReportService {

    MessageResponse createReport(CreateReportRequest request);
}
