package com.bencomester.vr_booking.data.entity;

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

    private String status;

    @ManyToMany
    @JoinTable(
            name = "headset_game",
            joinColumns = @JoinColumn(name = "headset_id"),
            inverseJoinColumns = @JoinColumn(name = "game_id")
    )
    private Set<GameEntity> installedGames = new HashSet<>();
}
