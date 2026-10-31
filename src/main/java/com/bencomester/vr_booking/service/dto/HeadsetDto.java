package com.bencomester.vr_booking.service.dto;

import com.bencomester.vr_booking.data.enums.HeadsetStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HeadsetDto {
    private Long id;

    @NotBlank(message = "Headset name is required")
    private String name;

    @NotNull(message = "Hourly price is required")
    @Positive(message = "Hourly price must be greater than zero")
    private Double hourlyPrice;

    @NotNull(message = "Status is required")
    private HeadsetStatus status;

    @Size(max = 2000)
    private String description;

    @Size(max = 1000)
    private String imageUrl;
    private Set<GameDto> installedGames;
}
