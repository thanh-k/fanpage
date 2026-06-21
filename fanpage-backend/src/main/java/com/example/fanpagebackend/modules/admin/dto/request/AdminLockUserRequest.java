package com.example.fanpagebackend.modules.admin.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminLockUserRequest {
    private String duration;
    private String reason;
}
