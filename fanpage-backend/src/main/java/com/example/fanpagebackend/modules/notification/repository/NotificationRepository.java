package com.example.fanpagebackend.modules.notification.repository;

import com.example.fanpagebackend.modules.notification.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    long countByRecipientIdAndReadFalse(Long recipientId);

    void deleteByRecipientIdOrSenderId(Long recipientId, Long senderId);
}