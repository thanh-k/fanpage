package com.example.fanpagebackend.modules.post.dto.response;

import com.example.fanpagebackend.common.MediaType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PostMediaResponse {

    private Long id;
    private String url;
    private MediaType type;
    private Integer sortOrder;
}
