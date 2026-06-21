package com.example.fanpagebackend.modules.admin.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Builder
public class AdminRoleResponse {
    private Long id;
    private String name;
    private String description;
    private boolean active;
    private Set<String> permissions;
    private int staffCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
