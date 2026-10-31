package com.bencomester.vr_booking.data.entity;

import com.bencomester.vr_booking.data.enums.HeadsetStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "headset")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HeadsetEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private Double hourlyPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HeadsetStatus status = HeadsetStatus.AVAILABLE;

    @Column(length = 2000)
    private String description;

    @Column(length = 1000)
    private String imageUrl;

    @ManyToMany
    @JoinTable(
            name = "headset_game",
            joinColumns = @JoinColumn(name = "headset_id"),
            inverseJoinColumns = @JoinColumn(name = "game_id")
    )
    private Set<GameEntity> installedGames = new HashSet<>();
}
