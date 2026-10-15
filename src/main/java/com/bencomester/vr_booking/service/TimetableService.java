package com.bencomester.vr_booking.service;

import com.bencomester.vr_booking.service.dto.TimetableResponseDto;

public interface TimetableService {
    int MIN_RESERVATION_LENGTH_IN_MINUTES = 30;

    TimetableResponseDto getAvailableTimetable();
}
