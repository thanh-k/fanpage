package com.example.fanpagebackend.modules.post.repository;

import com.example.fanpagebackend.modules.post.entity.PostMedia;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostMediaRepository extends JpaRepository<PostMedia, Long> {
}
