package com.example.fanpagebackend.modules.auth.dto.response;

import lombok.Builder;
import lombok.Getter;
import com.example.fanpagebackend.modules.user.dto.response.UserProfileResponse;

@Getter
@Builder
public class AuthResponse {

    private String token;
    private UserProfileResponse user;
}
