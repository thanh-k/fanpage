package com.example.fanpagebackend.modules.user.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PublicUserProfileResponse {

    private Long id;
    private String name;
    private String username;
    private String avatar;
    private String bio;
    private String location;
    private String gender;
    private LocalDateTime joinedAt;
    private Long publicPostsCount;
    private String emailMasked;
    private String friendshipStatus;
}
