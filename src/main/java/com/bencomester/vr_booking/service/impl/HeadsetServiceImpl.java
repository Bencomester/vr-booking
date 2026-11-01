package com.bencomester.vr_booking.service.impl;

import com.bencomester.vr_booking.data.entity.HeadsetEntity;
import com.bencomester.vr_booking.data.entity.ReservationEntity;
import com.bencomester.vr_booking.data.repository.HeadsetRepository;
import com.bencomester.vr_booking.data.repository.ReservationRepository;
import com.bencomester.vr_booking.exception.ResourceNotFoundException;
import com.bencomester.vr_booking.service.HeadsetService;
import com.bencomester.vr_booking.service.dto.HeadsetDto;
import com.bencomester.vr_booking.service.mapper.GameMapper;
import com.bencomester.vr_booking.service.mapper.HeadsetMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class HeadsetServiceImpl implements HeadsetService {

    private final HeadsetRepository headsetRepository;
    private final ReservationRepository reservationRepository;
    private final HeadsetMapper headsetMapper;
    private final GameMapper gameMapper;

    @Override
    @Transactional(readOnly = true)
    public List<HeadsetDto> findAll() {
        List<HeadsetDto> headsets = headsetMapper.toDto(headsetRepository.findAll());
        log.debug("Fetched {} headsets", headsets.size());
        return headsets;
    }

    @Override
    @Transactional(readOnly = true)
    public HeadsetDto findById(Long id) {
        log.debug("Looking up headset id={}", id);
        return headsetRepository.findById(id)
                .map(headsetMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("No Headset found with id: " + id));
    }

    @Override
    @Transactional
    public HeadsetDto save(HeadsetDto headsetDto) {
        HeadsetEntity headsetEntity = headsetMapper.toEntity(headsetDto);
        headsetEntity.setId(null);
        HeadsetEntity saved = headsetRepository.save(headsetEntity);
        log.info("Created headset id={} name='{}' status={} price={}",
                saved.getId(), saved.getName(), saved.getStatus(), saved.getHourlyPrice());
        return headsetMapper.toDto(saved);
    }

    @Override
    @Transactional
    public HeadsetDto update(Long id, HeadsetDto headsetDto) {
        HeadsetEntity existing = headsetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No Headset found with id: " + id));
        existing.setName(headsetDto.getName());
        existing.setHourlyPrice(headsetDto.getHourlyPrice());
        existing.setStatus(headsetDto.getStatus());
        existing.setDescription(headsetDto.getDescription());
        existing.setImageUrl(headsetDto.getImageUrl());
        existing.setInstalledGames(gameMapper.toEntity(headsetDto.getInstalledGames()));
        HeadsetEntity saved = headsetRepository.save(existing);
        log.info("Updated headset id={} name='{}' status={}", saved.getId(), saved.getName(), saved.getStatus());
        return headsetMapper.toDto(saved);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        if (!headsetRepository.existsById(id)) {
            throw new ResourceNotFoundException("No Headset found with id: " + id);
        }
        List<ReservationEntity> reservations = reservationRepository.findAllByHeadset_id(id);
        if (!reservations.isEmpty()) {
            reservationRepository.deleteAll(reservations);
            log.info("Deleted {} associated reservations for headset id={}", reservations.size(), id);
        }
        headsetRepository.deleteById(id);
        log.info("Deleted headset id={}", id);
    }
}
