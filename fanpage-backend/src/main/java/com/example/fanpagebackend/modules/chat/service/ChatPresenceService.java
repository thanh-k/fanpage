package com.example.fanpagebackend.modules.chat.service;

import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChatPresenceService {

    private final ConcurrentHashMap<Long, Integer> sessionCounts = new ConcurrentHashMap<>();

    public boolean userConnected(Long userId) {
        Integer count = sessionCounts.merge(userId, 1, Integer::sum);
        return count == 1;
    }

    public boolean userDisconnected(Long userId) {
        Integer count = sessionCounts.computeIfPresent(userId, (id, current) -> current <= 1 ? null : current - 1);
        return count == null;
    }

    public boolean isOnline(Long userId) {
        return userId != null && sessionCounts.containsKey(userId);
    }

    public Set<Long> getOnlineUserIds() {
        return Collections.unmodifiableSet(new HashSet<>(sessionCounts.keySet()));
    }
}
