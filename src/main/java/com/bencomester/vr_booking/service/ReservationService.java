package com.bencomester.vr_booking.service;

import com.bencomester.vr_booking.data.enums.ReservationStatus;
import com.bencomester.vr_booking.service.dto.ReservationCreateDto;
import com.bencomester.vr_booking.service.dto.ReservationDto;

import java.util.List;

public interface ReservationService {
    ReservationDto makeReservation(ReservationCreateDto reservationDto, String userEmail);
    ReservationDto cancelReservation(Long reservationId, String userEmail);
    List<ReservationDto> findAll();
    ReservationDto findById(Long id);
    ReservationDto updateStatus(Long id, ReservationStatus status);
    void deleteById(Long id);
}
