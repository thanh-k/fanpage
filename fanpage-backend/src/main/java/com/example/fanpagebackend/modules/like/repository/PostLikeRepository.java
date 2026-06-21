package com.example.fanpagebackend.modules.like.repository;

import com.example.fanpagebackend.modules.like.entity.PostLike;
import com.example.fanpagebackend.modules.like.entity.ReactionType;
import com.example.fanpagebackend.modules.post.entity.Post;
import com.example.fanpagebackend.modules.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    Optional<PostLike> findByPostAndUser(Post post, User user);

    List<PostLike> findAllByPostAndUser(Post post, User user);

    long countByPost(Post post);

    long countByPostAndReactionType(Post post, ReactionType reactionType);

    boolean existsByPostAndUser(Post post, User user);

    List<PostLike> findByPost(Post post);

    @Modifying
    @Query("delete from PostLike l where l.user = :user")
    void deleteByUser(@Param("user") User user);
}
