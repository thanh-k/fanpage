package com.example.fanpagebackend.modules.post.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class CreatePostRequest {

    @Size(max = 5000, message = "Nội dung bài viết không được vượt quá 5000 ký tự")
    private String content;

    private boolean isAnonymous;

    private List<String> imageUrls = new ArrayList<>();

    private List<String> videoUrls = new ArrayList<>();
}
