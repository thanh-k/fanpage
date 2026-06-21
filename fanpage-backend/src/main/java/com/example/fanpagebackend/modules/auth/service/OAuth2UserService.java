package com.example.fanpagebackend.modules.auth.service;

import com.example.fanpagebackend.modules.user.entity.User;
import org.springframework.security.oauth2.core.user.OAuth2User;

public interface OAuth2UserService {

    User processGoogleUser(OAuth2User oAuth2User);
}
