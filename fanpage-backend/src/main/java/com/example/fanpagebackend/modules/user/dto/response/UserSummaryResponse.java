package com.example.fanpagebackend.modules.user.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserSummaryResponse {
    private Long id;
    private String name;
    private String username;
    private String avatar;
    private String gender;
    private String bio;
    private String friendshipStatus;
    private boolean online;
}
