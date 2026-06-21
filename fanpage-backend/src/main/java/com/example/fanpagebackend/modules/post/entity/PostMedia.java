package com.example.fanpagebackend.modules.post.entity;

import com.example.fanpagebackend.common.MediaType;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "post_media",
        indexes = {
                @Index(name = "idx_post_media_post_id", columnList = "post_id")
        })
public class PostMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String url;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MediaType type;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;
}
