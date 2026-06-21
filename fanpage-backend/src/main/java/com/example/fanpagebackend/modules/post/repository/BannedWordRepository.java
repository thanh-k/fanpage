package com.example.fanpagebackend.modules.post.repository;

import com.example.fanpagebackend.modules.post.entity.BannedWord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BannedWordRepository extends JpaRepository<BannedWord, Long> {
    boolean existsByWordIgnoreCase(String word);

    Page<BannedWord> findAllByOrderByCreatedAtDesc(Pageable pageable);
}