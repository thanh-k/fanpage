package com.example.fanpagebackend.modules.comment.entity;

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
@Table(name = "comments",
        indexes = {
                @Index(name = "idx_comments_post_id", columnList = "post_id"),
                @Index(name = "idx_comments_author_id", columnList = "author_id"),
                @Index(name = "idx_comments_created_at", columnList = "created_at")
        })
public class Comment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
}
