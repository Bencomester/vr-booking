package com.bencomester.vr_booking.service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimetableResponseDto {
    private List<TimeBlock> availableTimes;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeBlock {
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Long headsetId;
    }
}