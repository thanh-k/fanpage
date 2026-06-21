package com.example.fanpagebackend.modules.comment.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddCommentRequest {

    @NotBlank(message = "Nội dung bình luận không được để trống")
    private String content;
}
