package com.example.fanpagebackend.modules.chat.repository;

import com.example.fanpagebackend.modules.chat.entity.ChatMessage;
import com.example.fanpagebackend.modules.user.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @EntityGraph(attributePaths = {"sender", "receiver"})
    @Query("select m from ChatMessage m where " +
            "(m.sender = :a and m.receiver = :b) or (m.sender = :b and m.receiver = :a) " +
            "order by m.createdAt desc")
    List<ChatMessage> findConversationNewestFirst(@Param("a") User a, @Param("b") User b, Pageable pageable);

    @Modifying
    @Query("delete from ChatMessage m where m.sender = :user or m.receiver = :user")
    void deleteAllByUser(@Param("user") User user);
}
