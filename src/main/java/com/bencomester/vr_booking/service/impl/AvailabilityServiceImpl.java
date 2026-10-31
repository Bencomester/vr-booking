package com.bencomester.vr_booking.service.impl;

import com.bencomester.vr_booking.data.entity.AvailabilityEntity;
import com.bencomester.vr_booking.data.repository.AvailabilityRepository;
import com.bencomester.vr_booking.service.AvailabilityService;
import com.bencomester.vr_booking.service.dto.AvailabilityDto;
import com.bencomester.vr_booking.service.mapper.AvailabilityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AvailabilityServiceImpl implements AvailabilityService {

    private final AvailabilityRepository availabilityRepository;
    private final AvailabilityMapper availabilityMapper;

    @Override
    @Transactional(readOnly = true)
    public List<AvailabilityDto> findAll() {
        return availabilityMapper.toDto(availabilityRepository.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public AvailabilityDto findById(Long id) {
        return availabilityRepository.findById(id)
                .map(availabilityMapper::toDto)
                .orElseThrow(() -> new IllegalArgumentException("No available time found with id: " + id));
    }

    @Override
    @Transactional
    public AvailabilityDto save(AvailabilityDto availabilityDto) {
        validateTimes(availabilityDto);
        AvailabilityEntity avail = availabilityMapper.toEntity(availabilityDto);
        avail.setId(null);
        return availabilityMapper.toDto(availabilityRepository.save(avail));
    }

    @Override
    @Transactional
    public AvailabilityDto update(Long id, AvailabilityDto availabilityDto) {
        validateTimes(availabilityDto);
        AvailabilityEntity existing = availabilityRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No available time found with id: " + id));
        existing.setStartTime(availabilityDto.getStartTime());
        existing.setEndTime(availabilityDto.getEndTime());
        return availabilityMapper.toDto(availabilityRepository.save(existing));
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        availabilityRepository.deleteById(id);
    }

    private void validateTimes(AvailabilityDto dto) {
        if (dto.getStartTime() == null || dto.getEndTime() == null || !dto.getStartTime().isBefore(dto.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time.");
        }
    }
}
