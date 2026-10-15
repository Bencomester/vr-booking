package com.bencomester.vr_booking.controller;

import com.bencomester.vr_booking.service.TimetableService;
import com.bencomester.vr_booking.service.dto.TimetableResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/timetable")
@RequiredArgsConstructor
public class TimetableController {

    private final TimetableService timetableService;

    @GetMapping
    public TimetableResponseDto getTimetable() {
        return timetableService.getAvailableTimetable();
    }
}
