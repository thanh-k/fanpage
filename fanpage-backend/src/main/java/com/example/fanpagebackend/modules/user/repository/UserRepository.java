package com.example.fanpagebackend.modules.user.repository;

import com.example.fanpagebackend.common.Role;
import com.example.fanpagebackend.modules.admin.entity.StaffRole;
import com.example.fanpagebackend.modules.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByProviderAndProviderId(String provider, String providerId);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    List<User> findByRoleOrderByJoinedAtDesc(Role role);

    Page<User> findByRoleOrderByJoinedAtDesc(Role role, Pageable pageable);

    List<User> findByRoleInOrderByJoinedAtDesc(Collection<Role> roles);

    Page<User> findByRoleInOrderByJoinedAtDesc(Collection<Role> roles, Pageable pageable);

    long countByRole(Role role);

    long countByStaffRole(StaffRole staffRole);

    @Query("select u from User u where u.id <> :currentUserId and " +
            "(lower(u.fullName) like lower(concat('%', :keyword, '%')) or " +
            "lower(u.username) like lower(concat('%', :keyword, '%')) or " +
            "lower(u.email) like lower(concat('%', :keyword, '%'))) " +
            "order by u.fullName asc")
    List<User> searchUsers(@Param("keyword") String keyword, @Param("currentUserId") Long currentUserId);
}
