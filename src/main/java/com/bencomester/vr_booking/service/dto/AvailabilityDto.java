package com.bencomester.vr_booking.service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityDto {
    private Long id;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
