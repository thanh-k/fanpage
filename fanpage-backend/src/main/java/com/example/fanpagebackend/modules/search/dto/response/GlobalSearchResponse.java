package com.example.fanpagebackend.modules.search.dto.response;

import com.example.fanpagebackend.modules.post.dto.response.PostResponse;
import com.example.fanpagebackend.modules.user.dto.response.UserSummaryResponse;
import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class GlobalSearchResponse {
    private List<UserSummaryResponse> users;
    private List<PostResponse> posts;
}
