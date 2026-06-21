package com.example.fanpagebackend.modules.admin.entity;

import com.example.fanpagebackend.common.Permission;
import jakarta.persistence.*;
import lombok.*;

import java.util.LinkedHashSet;
import java.util.Set;
import com.example.fanpagebackend.common.BaseEntity;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "staff_roles", uniqueConstraints = {
        @UniqueConstraint(name = "uk_staff_roles_name", columnNames = "name")
})
public class StaffRole extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "staff_role_permissions", joinColumns = @JoinColumn(name = "staff_role_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "permission", nullable = false, length = 60)
    @Builder.Default
    private Set<Permission> permissions = new LinkedHashSet<>();
}
