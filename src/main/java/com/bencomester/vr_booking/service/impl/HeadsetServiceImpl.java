package com.bencomester.vr_booking.service.impl;

import com.bencomester.vr_booking.data.entity.HeadsetEntity;
import com.bencomester.vr_booking.data.repository.HeadsetRepository;
import com.bencomester.vr_booking.service.HeadsetService;
import com.bencomester.vr_booking.service.dto.HeadsetDto;
import com.bencomester.vr_booking.service.mapper.GameMapper;
import com.bencomester.vr_booking.service.mapper.HeadsetMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HeadsetServiceImpl implements HeadsetService {

    private final HeadsetRepository headsetRepository;
    private final HeadsetMapper headsetMapper;
    private final GameMapper gameMapper;

    @Override
    public List<HeadsetDto> findAll() {
        return headsetMapper.toDto(headsetRepository.findAll());
    }

    @Override
    public HeadsetDto findById(Long id) {
        return headsetRepository.findById(id)
                .map(headsetMapper::toDto)
                .orElseThrow(() -> new IllegalArgumentException("No Headset found with id: " + id));
    }

    @Override
    public HeadsetDto save(HeadsetDto headsetDto) {
        HeadsetEntity headsetEntity = headsetMapper.toEntity(headsetDto);
        return headsetMapper.toDto(headsetRepository.save(headsetEntity));
    }

    @Override
    public HeadsetDto update(Long id, HeadsetDto headsetDto) {
        HeadsetEntity existing = headsetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No Headset found with id: " + id));
        existing.setName(headsetDto.getName());
        existing.setHourlyPrice(headsetDto.getHourlyPrice());
        existing.setStatus(headsetDto.getStatus());
        existing.setInstalledGames(gameMapper.toEntity(headsetDto.getInstalledGames()));
        return headsetMapper.toDto(headsetRepository.save(existing));
    }

    @Override
    public void deleteById(Long id) {
        headsetRepository.deleteById(id);
    }
}
