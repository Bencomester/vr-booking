package com.bencomester.vr_booking.service;

import com.bencomester.vr_booking.service.dto.*;

import java.util.List;

public interface UserService {
    AuthResponseDto register(RegisterRequestDto registerRequestDto);
    AuthResponseDto login(LoginRequestDto loginRequestDto);
    UserDto getAccountDetails(String email);
    List<ReservationDto> getUserReservations(String email);
}
