package com.bencomester.vr_booking.controller;

import com.bencomester.vr_booking.data.enums.ReservationStatus;
import com.bencomester.vr_booking.service.ReservationService;
import com.bencomester.vr_booking.service.dto.ReservationCreateDto;
import com.bencomester.vr_booking.service.dto.ReservationDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservation")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    public ReservationDto createReservation(@Valid @RequestBody ReservationCreateDto reservationDto, Authentication authentication) {
        return reservationService.makeReservation(reservationDto, authentication.getName());
    }

    @PostMapping("/{id}/cancel")
    public ReservationDto cancelReservation(@PathVariable Long id, Authentication authentication) {
        return reservationService.cancelReservation(id, authentication.getName());
    }

    @GetMapping("/all")
    public List<ReservationDto> getAllReservations(Authentication authentication) {
        return reservationService.findAll(authentication.getName());
    }

    @GetMapping
    public List<ReservationDto> getAllUserReservations(Authentication authentication) {
        return reservationService.findAllByUser(authentication.getName());
    }

    @GetMapping("/{id}")
    public ReservationDto getReservation(@PathVariable Long id) {
        return reservationService.findById(id);
    }

    @PutMapping("/{id}/status")
    public ReservationDto updateStatus(@PathVariable Long id, @RequestParam String status, Authentication authentication) {
        return reservationService.updateStatus(id, ReservationStatus.fromValue(status), authentication.getName());
    }

    @DeleteMapping("/{id}")
    public void deleteReservation(@PathVariable Long id, Authentication authentication) {
        reservationService.deleteById(id, authentication.getName());
    }
}
