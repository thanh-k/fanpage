package com.example.fanpagebackend.modules.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class AdminUpdateRoleRequest {
    @NotBlank(message = "Tên role không được trống")
    private String name;
    private String description;
    private boolean active = true;
    @NotEmpty(message = "Role phải có ít nhất một quyền")
    private Set<String> permissions;
}
