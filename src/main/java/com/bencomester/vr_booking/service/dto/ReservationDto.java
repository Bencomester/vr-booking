package com.bencomester.vr_booking.service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationDto {
    private Long id;
    private Long userId;
    private String userFullName;
    private Long headsetId;
    private String headsetName;
    LocalDateTime startTime;
    LocalDateTime endTime;
    String status;
}
