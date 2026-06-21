package com.example.fanpagebackend.modules.admin.repository;

import com.example.fanpagebackend.modules.admin.entity.StaffRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StaffRoleRepository extends JpaRepository<StaffRole, Long> {
    Optional<StaffRole> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
    List<StaffRole> findAllByOrderByCreatedAtDesc();
    long countByActiveTrue();
}
