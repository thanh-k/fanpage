package com.example.fanpagebackend.modules.friend.repository;

import com.example.fanpagebackend.common.FriendshipStatus;
import com.example.fanpagebackend.modules.friend.entity.FriendRequest;
import com.example.fanpagebackend.modules.user.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {

    @EntityGraph(attributePaths = {"requester", "addressee"})
    Optional<FriendRequest> findByRequesterAndAddressee(User requester, User addressee);

    @EntityGraph(attributePaths = {"requester", "addressee"})
    @Query("select f from FriendRequest f where " +
            "((f.requester = :a and f.addressee = :b) or (f.requester = :b and f.addressee = :a))")
    Optional<FriendRequest> findBetween(@Param("a") User a, @Param("b") User b);

    @EntityGraph(attributePaths = {"requester", "addressee"})
    List<FriendRequest> findByAddresseeAndStatusOrderByCreatedAtDesc(User addressee, FriendshipStatus status);

    @EntityGraph(attributePaths = {"requester", "addressee"})
    List<FriendRequest> findByRequesterAndStatusOrderByCreatedAtDesc(User requester, FriendshipStatus status);

    @EntityGraph(attributePaths = {"requester", "addressee"})
    @Query("select f from FriendRequest f where (f.requester = :user or f.addressee = :user) and f.status = :status order by f.updatedAt desc")
    List<FriendRequest> findAcceptedByUser(@Param("user") User user, @Param("status") FriendshipStatus status);

    @Query("select case when count(f) > 0 then true else false end from FriendRequest f where " +
            "((f.requester = :a and f.addressee = :b) or (f.requester = :b and f.addressee = :a)) and f.status = 'ACCEPTED'")
    boolean areFriends(@Param("a") User a, @Param("b") User b);

    @Modifying
    @Query("delete from FriendRequest f where f.requester = :user or f.addressee = :user")
    void deleteAllByUser(@Param("user") User user);
}
