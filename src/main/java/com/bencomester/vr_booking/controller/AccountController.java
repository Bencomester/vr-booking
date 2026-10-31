package com.bencomester.vr_booking.controller;

import com.bencomester.vr_booking.service.UserService;
import com.bencomester.vr_booking.service.dto.ReservationDto;
import com.bencomester.vr_booking.service.dto.UserDto;
import com.bencomester.vr_booking.service.dto.UserUpdateDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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

    @PutMapping
    public UserDto updateAccountDetails(@Valid @RequestBody UserUpdateDto userUpdateDto, Authentication authentication) {
        return userService.updateAccountDetails(authentication.getName(), userUpdateDto);
    }

    @GetMapping("/reservation")
    public List<ReservationDto> getMyReservations(Authentication authentication) {
        return userService.getUserReservations(authentication.getName());
    }
}
