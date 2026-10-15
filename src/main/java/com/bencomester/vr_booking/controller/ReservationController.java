package com.bencomester.vr_booking.controller;

import com.bencomester.vr_booking.data.enums.ReservationStatus;
import com.bencomester.vr_booking.service.ReservationService;
import com.bencomester.vr_booking.service.dto.ReservationCreateDto;
import com.bencomester.vr_booking.service.dto.ReservationDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservation")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    public ReservationDto createReservation(@RequestBody ReservationCreateDto reservationDto) {
        return reservationService.makeReservation(reservationDto);
    }

    @PostMapping("/{id}/cancel")
    public ReservationDto cancelReservation(@PathVariable Long id) {
        return reservationService.cancelReservation(id);
    }

    @GetMapping
    public List<ReservationDto> getAllReservations() {
        return reservationService.findAll();
    }

    @GetMapping("/{id}")
    public ReservationDto getReservation(@PathVariable Long id) {
        return reservationService.findById(id);
    }

    @PutMapping("/{id}/status")
    public ReservationDto updateStatus(@PathVariable Long id, @RequestParam ReservationStatus status) {
        return reservationService.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public void deleteReservation(@PathVariable Long id) {
        reservationService.deleteById(id);
    }
}
