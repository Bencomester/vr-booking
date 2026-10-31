package com.bencomester.vr_booking.service;

import com.bencomester.vr_booking.service.dto.GameDto;
import com.bencomester.vr_booking.service.dto.SteamGameDetailsDto;

import java.util.List;

public interface GameService {
    List<GameDto> findAll();
    GameDto findById(Long id);
    GameDto save(GameDto gameDto);
    GameDto update(Long id, GameDto gameDto);
    void deleteById(Long id);
    SteamGameDetailsDto fetchSteamGameDetails(String appId);
}
