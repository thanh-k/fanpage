package com.example.fanpagebackend.modules.chat.websocket;

import com.example.fanpagebackend.modules.user.entity.User;
import com.example.fanpagebackend.modules.user.repository.UserRepository;
import com.example.fanpagebackend.security.CustomUserDetailsService;
import com.example.fanpagebackend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class ChatWebSocketHandshakeInterceptor
        implements HandshakeInterceptor {

    private final JwtService jwtService;

    private final CustomUserDetailsService
            userDetailsService;

    private final UserRepository userRepository;

    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes
    ) {

        try {

            String token =
                    UriComponentsBuilder
                            .fromUri(request.getURI())
                            .build()
                            .getQueryParams()
                            .getFirst("token");

            if (token == null || token.isBlank()) {

                System.out.println(
                        "WEBSOCKET TOKEN NULL"
                );

                return false;
            }

            String username =
                    jwtService.extractUsername(token);

            UserDetails userDetails =
                    userDetailsService
                            .loadUserByUsername(username);

            if (!jwtService.isTokenValid(
                    token,
                    userDetails
            )) {

                System.out.println(
                        "WEBSOCKET TOKEN INVALID"
                );

                return false;
            }

            User user =
                    userRepository
                            .findByUsername(username)
                            .orElse(null);

            if (user == null) {

                System.out.println(
                        "WEBSOCKET USER NULL"
                );

                return false;
            }

            attributes.put(
                    "userId",
                    user.getId()
            );

            attributes.put(
                    "username",
                    user.getUsername()
            );

            System.out.println(
                    "WEBSOCKET CONNECTED: "
                            + user.getUsername()
            );

            return true;

        } catch (Exception e) {

            System.out.println(
                    "WEBSOCKET AUTH ERROR"
            );

            e.printStackTrace();

            return false;
        }
    }

    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception
    ) {

    }
}