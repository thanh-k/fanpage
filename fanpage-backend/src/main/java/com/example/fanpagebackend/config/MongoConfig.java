package com.example.fanpagebackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoAuditing
@EnableMongoRepositories(basePackages = {
        "com.example.fanpagebackend.modules.chat.repository.mongo",
        "com.example.fanpagebackend.modules.notification.repository"
})
public class MongoConfig {
}