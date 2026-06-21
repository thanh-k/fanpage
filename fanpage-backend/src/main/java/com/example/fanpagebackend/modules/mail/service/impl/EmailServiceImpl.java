package com.example.fanpagebackend.modules.mail.service.impl;

import com.example.fanpagebackend.modules.mail.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Override
    public void sendOtpEmail(String toEmail, String fullName, String code, String subject, String actionText) {
        String displayName = fullName == null || fullName.isBlank() ? "bạn" : fullName;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(buildContent(displayName, code, actionText));
        mailSender.send(message);
    }

    private String buildContent(String displayName, String code, String actionText) {
        return "Xin chào " + displayName + ",\n\n"
                + "Mã xác thực để " + actionText + " là: " + code + "\n"
                + "Mã có hiệu lực trong 10 phút.\n\n"
                + "Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email.\n\n"
                + "Trân trọng.";
    }
}
