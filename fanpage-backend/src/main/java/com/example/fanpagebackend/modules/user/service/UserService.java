package com.example.fanpagebackend.modules.user.service;

import com.example.fanpagebackend.modules.user.dto.request.UpdateMyProfileRequest;
import com.example.fanpagebackend.modules.user.dto.response.PublicUserProfileResponse;
import com.example.fanpagebackend.modules.user.dto.response.UserProfileResponse;
import com.example.fanpagebackend.modules.user.dto.response.UserSummaryResponse;
import com.example.fanpagebackend.common.dto.response.MessageResponse;

import java.util.List;
import com.example.fanpagebackend.modules.user.entity.User;

public interface UserService {

    UserProfileResponse getMyProfile();

    PublicUserProfileResponse getPublicProfile(Long userId);

    UserProfileResponse updateMyProfile(UpdateMyProfileRequest request);

    User getUserEntityById(Long userId);

    List<UserSummaryResponse> searchUsers(String keyword);

    MessageResponse requestAccountDeletion(String reason);
}
