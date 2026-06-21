package com.example.fanpagebackend.modules.mail.service;

public interface EmailService {

    void sendOtpEmail(String toEmail, String fullName, String code, String subject, String actionText);
}
