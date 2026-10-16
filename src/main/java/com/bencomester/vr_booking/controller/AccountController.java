package com.bencomester.vr_booking.controller;

import com.bencomester.vr_booking.service.UserService;
import com.bencomester.vr_booking.service.dto.ReservationDto;
import com.bencomester.vr_booking.service.dto.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
public class AccountController {

    private final UserService userService;

    @GetMapping
    public UserDto getAccountDetails(Authentication authentication) {
        return userService.getAccountDetails(authentication.getName());
    }

    @GetMapping("/reservation")
    public List<ReservationDto> getMyReservations(Authentication authentication) {
        return userService.getUserReservations(authentication.getName());
    }
}
