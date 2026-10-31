package com.bencomester.vr_booking.service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RigDto {
    private Long id;

    @NotBlank(message = "Rig name is required")
    private String name;
    private String cpu;
    private String gpu;
    private String ram;
    private String os;

    @Size(max = 1000)
    private String imageUrl;

    @Size(max = 2000)
    private String description;
}
