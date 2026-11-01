package com.bencomester.vr_booking.data.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Entity
@Table(name = "user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    private String fullName;
    private String phoneNumber;

    @Column(length = 1000)
    private String profilePictureUrl;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now(ZoneId.systemDefault());

    @ManyToOne(fetch = FetchType.EAGER)
    private RoleEntity role;
}