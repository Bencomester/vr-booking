package com.bencomester.vr_booking.service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HeadsetDto {
    private Long id;
    private String name;
    private Double hourlyPrice;
    private String status;
    private Set<GameDto> installedGames;
}
