package com.example.fanpagebackend.modules.post.repository;

import com.example.fanpagebackend.common.PostStatus;
import com.example.fanpagebackend.modules.post.entity.Post;
import com.example.fanpagebackend.modules.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    @EntityGraph(attributePaths = {"author", "mediaList"})
    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @EntityGraph(attributePaths = {"author", "mediaList"})
    Page<Post> findByAuthorOrderByCreatedAtDesc(User author, Pageable pageable);

    @EntityGraph(attributePaths = {"author", "mediaList"})
    Page<Post> findByAuthorAndAnonymousFalseOrderByCreatedAtDesc(User author, Pageable pageable);

    long countByAuthorAndAnonymousFalse(User author);

    List<Post> findAllByAuthor(User author);

    long countByStatus(PostStatus status);

    @EntityGraph(attributePaths = {"author", "mediaList"})
    @Query("select p from Post p where p.author.id in :authorIds order by p.createdAt desc")
    Page<Post> findByAuthorIdsOrderByCreatedAtDesc(@Param("authorIds") java.util.List<Long> authorIds, Pageable pageable);

    @EntityGraph(attributePaths = {"author", "mediaList"})
    @Query("select p from Post p where p.author.id not in :excludedUserIds and p.anonymous = false order by p.createdAt desc")
    Page<Post> findStrangerPosts(@Param("excludedUserIds") java.util.List<Long> excludedUserIds, Pageable pageable);

    @EntityGraph(attributePaths = {"author", "mediaList"})
    @Query("select p from Post p where p.anonymous = false and lower(p.content) like lower(concat('%', :keyword, '%')) order by p.createdAt desc")
    Page<Post> searchPublicPosts(@Param("keyword") String keyword, Pageable pageable);

    @Modifying
    @Query("delete from Post p where p.author = :user")
    void deleteByAuthor(@Param("user") User user);
}
