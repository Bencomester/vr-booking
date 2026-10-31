package com.bencomester.vr_booking.service.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GameDto {

    private Long id;

    @NotBlank(message = "Game title is required")
    private String title;

    @Size(max = 2000)
    private String description;

    @Max(Integer.MAX_VALUE)
    @Min(0)
    private Integer steamAppId;

    @Size(max = 1000)
    private String imageUrl;
}
