package com.bencomester.vr_booking.data.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rig")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RigEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String cpu;
    private String gpu;
    private String ram;
    private String os;

    @Column(length = 1000)
    private String imageUrl;

    @Column(length = 2000)
    private String description;
}