package com.example.fanpagebackend.modules.comment.repository;

import com.example.fanpagebackend.modules.comment.entity.Comment;
import com.example.fanpagebackend.modules.post.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    @EntityGraph(attributePaths = {"author", "post"})
    List<Comment> findByPostOrderByCreatedAtAsc(Post post);

    @EntityGraph(attributePaths = {"author", "post"})
    Page<Comment> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByPost(Post post);

    @Modifying
    @Query("delete from Comment c where c.author = :user")
    void deleteByAuthor(@Param("user") com.example.fanpagebackend.modules.user.entity.User user);
}
