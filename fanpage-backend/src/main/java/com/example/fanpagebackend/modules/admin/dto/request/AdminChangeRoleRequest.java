package com.example.fanpagebackend.modules.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminChangeRoleRequest {
    @NotBlank(message = "Vai trò không được để trống")
    private String role;
}
