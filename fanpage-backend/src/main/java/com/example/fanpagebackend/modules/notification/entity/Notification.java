package com.example.fanpagebackend.modules.notification.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    @Indexed
    private Long recipientId;

    private Long senderId;

    private String senderName;

    private String senderAvatar;

    private String type;

    private Long targetId;

    private String message;

    private boolean read;

    @Indexed
    private String redirectUrl;

    private Date createdAt;
}