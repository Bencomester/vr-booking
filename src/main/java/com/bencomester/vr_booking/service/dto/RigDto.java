package com.bencomester.vr_booking.service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RigDto {
    private Long id;
    private String name;
    private String cpu;
    private String gpu;
    private String ram;
    private String description;
}
