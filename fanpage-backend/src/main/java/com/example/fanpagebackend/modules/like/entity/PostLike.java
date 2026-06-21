package com.example.fanpagebackend.modules.like.entity;

import jakarta.persistence.*;
import lombok.*;
import com.example.fanpagebackend.common.BaseEntity;
import com.example.fanpagebackend.modules.post.entity.Post;
import com.example.fanpagebackend.modules.user.entity.User;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "post_likes",
        indexes = {
                @Index(name = "idx_post_likes_post_id", columnList = "post_id"),
                @Index(name = "idx_post_likes_user_id", columnList = "user_id")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_post_likes_post_user", columnNames = {"post_id", "user_id"})
        })
public class PostLike extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "reaction_type", length = 20)
    @Builder.Default
    private ReactionType reactionType = ReactionType.LIKE;
}
