package com.bencomester.vr_booking.controller;

import com.bencomester.vr_booking.service.GameService;
import com.bencomester.vr_booking.service.dto.GameDto;
import com.bencomester.vr_booking.service.dto.SteamGameDetailsDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/game")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    @GetMapping
    public List<GameDto> getAllGames() {
        return gameService.findAll();
    }

    @GetMapping("/{id}")
    public GameDto getGameById(@PathVariable Long id) {
        return gameService.findById(id);
    }

    @GetMapping("/steam/{appId}")
    public SteamGameDetailsDto getSteamGameDetails(@PathVariable String appId) {
        return gameService.fetchSteamGameDetails(appId);
    }

    @PostMapping
    public GameDto createGame(@Valid @RequestBody GameDto gameDto) {
        return gameService.save(gameDto);
    }

    @PutMapping("/{id}")
    public GameDto updateGame(@PathVariable Long id, @Valid @RequestBody GameDto gameDto) {
        return gameService.update(id, gameDto);
    }

    @DeleteMapping("/{id}")
    public void deleteGame(@PathVariable Long id) {
        gameService.deleteById(id);
    }
}
