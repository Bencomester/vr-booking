package com.bencomester.vr_booking.service;

import com.bencomester.vr_booking.data.enums.ReservationStatus;
import com.bencomester.vr_booking.service.dto.ReservationCreateDto;
import com.bencomester.vr_booking.service.dto.ReservationDto;

import java.util.List;

public interface ReservationService {
    ReservationDto makeReservation(ReservationCreateDto reservationDto, String userEmail);
    ReservationDto cancelReservation(Long reservationId, String userEmail);
    List<ReservationDto> findAll(String userEmail);
    List<ReservationDto> findAllByUser(String userEmail);
    ReservationDto findById(Long id);
    ReservationDto updateStatus(Long id, ReservationStatus status, String userEmail);
    void deleteById(Long id, String userEmail);
}
