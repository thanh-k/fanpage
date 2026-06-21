package com.example.fanpagebackend.modules.post.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BannedWordResponse {

    private Long id;

    private String word;

    private LocalDateTime createdAt;
}