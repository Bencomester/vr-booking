package com.bencomester.vr_booking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class TimetableResponseDto {
    private List<TimeBlock> availableBlocks;
    private List<TimeBlock> reservedBlocks;

    @Data
    @AllArgsConstructor
    public static class TimeBlock {
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Long headsetId;
    }
}