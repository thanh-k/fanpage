package com.example.fanpagebackend.modules.admin.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminPermissionResponse {
    private String code;
    private String label;
}
