package com.bencomester.vr_booking.service.dto;

import jakarta.validation.constraints.*;
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
    @Pattern(regexp = "^(https?://.*)?$", message = "Image URL must start with http:// or https://")
    private String imageUrl;
}
