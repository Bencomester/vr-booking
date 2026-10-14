package com.bencomester.vr_booking.service.impl;

import com.bencomester.vr_booking.data.entity.GameEntity;
import com.bencomester.vr_booking.data.repository.GameRepository;
import com.bencomester.vr_booking.service.GameService;
import com.bencomester.vr_booking.service.dto.GameDto;
import com.bencomester.vr_booking.service.mapper.GameMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GameServiceImpl implements GameService {

    private final GameRepository gameRepository;
    private final GameMapper gameMapper;

    @Override
    public List<GameDto> findAll() {
        return gameMapper.toDto(gameRepository.findAll());
    }

    @Override
    public GameDto findById(Long id) {
        return gameRepository.findById(id)
                .map(gameMapper::toDto)
                .orElseThrow(() -> new IllegalArgumentException("No Game found with id: " + id));
    }

    @Override
    public GameDto save(GameDto gameDto) {
        GameEntity gameEntity = gameMapper.toEntity(gameDto);
        return gameMapper.toDto(gameRepository.save(gameEntity));
    }

    @Override
    public GameDto update(Long id, GameDto gameDto) {
        GameEntity existing = gameRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No Game found with id: " + id));
        existing.setTitle(gameDto.getTitle());
        existing.setDescription(gameDto.getDescription());
        return gameMapper.toDto(gameRepository.save(existing));
    }

    @Override
    public void deleteById(Long id) {
        gameRepository.deleteById(id);
    }
}
