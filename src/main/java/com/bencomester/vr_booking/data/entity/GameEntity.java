package com.bencomester.vr_booking.data.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "game")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GameEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    private Integer steamAppId;

    @Column(length = 1000)
    private String imageUrl;
}
