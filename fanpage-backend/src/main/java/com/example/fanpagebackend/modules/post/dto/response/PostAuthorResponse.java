package com.example.fanpagebackend.modules.post.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PostAuthorResponse {

    private Long id;
    private String name;
    private String username;
    private String avatar;
}
