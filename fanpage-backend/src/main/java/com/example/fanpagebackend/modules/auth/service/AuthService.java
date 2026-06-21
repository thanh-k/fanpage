package com.example.fanpagebackend.modules.auth.service;

import com.example.fanpagebackend.modules.auth.dto.request.*;
import com.example.fanpagebackend.modules.user.dto.request.*;
import com.example.fanpagebackend.modules.post.dto.request.*;
import com.example.fanpagebackend.modules.comment.dto.request.*;
import com.example.fanpagebackend.modules.chat.dto.request.*;
import com.example.fanpagebackend.modules.admin.dto.request.*;
import com.example.fanpagebackend.modules.report.dto.request.*;
import com.example.fanpagebackend.modules.auth.dto.response.AuthResponse;
import com.example.fanpagebackend.common.dto.response.MessageResponse;
import com.example.fanpagebackend.modules.user.dto.response.UserProfileResponse;
import com.example.fanpagebackend.modules.auth.dto.request.ConfirmPasswordResetRequest;
import com.example.fanpagebackend.modules.auth.dto.request.LoginRequest;
import com.example.fanpagebackend.modules.auth.dto.request.RequestPasswordResetOtpRequest;
import com.example.fanpagebackend.modules.auth.dto.request.RequestRegisterOtpRequest;
import com.example.fanpagebackend.modules.auth.dto.request.VerifyRegisterOtpRequest;

public interface AuthService {

    MessageResponse requestRegisterOtp(RequestRegisterOtpRequest request);

    AuthResponse verifyRegisterOtp(VerifyRegisterOtpRequest request);

    AuthResponse login(LoginRequest request);

    UserProfileResponse getCurrentUserProfile();

    MessageResponse requestPasswordResetOtp(RequestPasswordResetOtpRequest request);

    MessageResponse confirmPasswordReset(ConfirmPasswordResetRequest request);
}
