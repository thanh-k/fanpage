package com.example.fanpagebackend.modules.friend.entity;

import com.example.fanpagebackend.common.FriendshipStatus;
import jakarta.persistence.*;
import lombok.*;
import com.example.fanpagebackend.common.BaseEntity;
import com.example.fanpagebackend.modules.user.entity.User;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "friend_requests",
        indexes = {
                @Index(name = "idx_friend_request_requester", columnList = "requester_id"),
                @Index(name = "idx_friend_request_addressee", columnList = "addressee_id"),
                @Index(name = "idx_friend_request_status", columnList = "status")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_friend_request_pair", columnNames = {"requester_id", "addressee_id"})
        })
public class FriendRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "addressee_id", nullable = false)
    private User addressee;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FriendshipStatus status;
}
