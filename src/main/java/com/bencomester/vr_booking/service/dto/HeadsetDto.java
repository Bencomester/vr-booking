package com.bencomester.vr_booking.service.dto;

import com.bencomester.vr_booking.data.enums.HeadsetStatus;
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
    private HeadsetStatus status;
    private Set<GameDto> installedGames;
}
