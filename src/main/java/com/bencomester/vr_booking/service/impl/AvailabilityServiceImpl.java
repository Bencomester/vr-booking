package com.bencomester.vr_booking.service.impl;

import com.bencomester.vr_booking.data.entity.AvailabilityEntity;
import com.bencomester.vr_booking.data.repository.AvailabilityRepository;
import com.bencomester.vr_booking.exception.InvalidInputException;
import com.bencomester.vr_booking.exception.ResourceNotFoundException;
import com.bencomester.vr_booking.service.AvailabilityService;
import com.bencomester.vr_booking.service.dto.AvailabilityDto;
import com.bencomester.vr_booking.service.mapper.AvailabilityMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AvailabilityServiceImpl implements AvailabilityService {

    private final AvailabilityRepository availabilityRepository;
    private final AvailabilityMapper availabilityMapper;

    @Override
    @Transactional(readOnly = true)
    public List<AvailabilityDto> findAll() {
        List<AvailabilityDto> list = availabilityMapper.toDto(availabilityRepository.findAll());
        log.debug("Fetched {} availability windows", list.size());
        return list;
    }

    @Override
    @Transactional(readOnly = true)
    public AvailabilityDto findById(Long id) {
        log.debug("Looking up availability window id={}", id);
        return availabilityRepository.findById(id)
                .map(availabilityMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("No available time window found with id: " + id));
    }

    @Override
    @Transactional
    public AvailabilityDto save(AvailabilityDto availabilityDto) {
        validateTimes(availabilityDto);
        AvailabilityEntity avail = availabilityMapper.toEntity(availabilityDto);
        avail.setId(null);
        AvailabilityEntity saved = availabilityRepository.save(avail);
        log.info("Created availability window id={} ({} -> {})", saved.getId(), saved.getStartTime(), saved.getEndTime());
        return availabilityMapper.toDto(saved);
    }

    @Override
    @Transactional
    public AvailabilityDto update(Long id, AvailabilityDto availabilityDto) {
        validateTimes(availabilityDto);
        AvailabilityEntity existing = availabilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No available time window found with id: " + id));
        existing.setStartTime(availabilityDto.getStartTime());
        existing.setEndTime(availabilityDto.getEndTime());
        AvailabilityEntity saved = availabilityRepository.save(existing);
        log.info("Updated availability window id={} ({} -> {})", saved.getId(), saved.getStartTime(), saved.getEndTime());
        return availabilityMapper.toDto(saved);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        if (!availabilityRepository.existsById(id)) {
            throw new ResourceNotFoundException("No available time window found with id: " + id);
        }
        availabilityRepository.deleteById(id);
        log.info("Deleted availability window id={}", id);
    }

    private void validateTimes(AvailabilityDto dto) {
        if (dto.getStartTime() == null || dto.getEndTime() == null || !dto.getStartTime().isBefore(dto.getEndTime())) {
            throw new InvalidInputException("Start time must be strictly before end time.");
        }
    }
}
