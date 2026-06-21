package com.example.fanpagebackend.modules.comment.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CommentAuthorResponse {

    private Long id;
    private String name;
    private String username;
    private String avatar;
}
