package com.bencomester.vr_booking.service;

import com.bencomester.vr_booking.service.dto.ReservationCreateDto;
import com.bencomester.vr_booking.service.dto.ReservationDto;

import java.util.List;

public interface ReservationService {
    ReservationDto makeReservation(ReservationCreateDto reservationDto);
    ReservationDto cancelReservation(Long reservationId);
    List<ReservationDto> findAll();
    ReservationDto findById(Long id);
    ReservationDto updateStatus(Long id, String status);
    void deleteById(Long id);
}
