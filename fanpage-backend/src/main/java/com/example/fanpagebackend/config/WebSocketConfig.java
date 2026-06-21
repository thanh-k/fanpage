package com.example.fanpagebackend.config;

import com.example.fanpagebackend.modules.chat.websocket.ChatWebSocketHandler;
import com.example.fanpagebackend.modules.chat.websocket.ChatWebSocketHandshakeInterceptor;
import com.example.fanpagebackend.modules.notification.websocket.NotificationWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig
        implements WebSocketConfigurer {

    private final ChatWebSocketHandler
            chatWebSocketHandler;

    private final ChatWebSocketHandshakeInterceptor
            chatWebSocketHandshakeInterceptor;

    private final NotificationWebSocketHandler
            notificationWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(
            WebSocketHandlerRegistry registry
    ) {

        registry
                .addHandler(
                        chatWebSocketHandler,
                        "/ws/chat"
                )
                .addInterceptors(
                        chatWebSocketHandshakeInterceptor
                )
                .setAllowedOriginPatterns("*");

        registry
                .addHandler(
                        notificationWebSocketHandler,
                        "/ws/notifications"
                )
                .addInterceptors(
                        chatWebSocketHandshakeInterceptor
                )
                .setAllowedOriginPatterns("*");
    }
}