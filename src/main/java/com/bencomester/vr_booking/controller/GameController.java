package com.bencomester.vr_booking.controller;

import com.bencomester.vr_booking.entity.GameEntity;
import com.bencomester.vr_booking.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/game")
@RequiredArgsConstructor
public class GameController {

    private final GameRepository gameRepository;

    @GetMapping
    public List<GameEntity> getAllHeadsets() {
        return gameRepository.findAll();
    }
}
