package com.compilerdemo.complier_demo.Model.DAO;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "branches", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "project_id", "name" })
})
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Branch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "main_project_id", nullable = false)
    private Project mainProject;

    @OneToOne(fetch = FetchType.LAZY ,cascade = CascadeType.ALL, orphanRemoval = true )
    @JoinColumn(name = "branch_project_id")
    private Project branchProject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
