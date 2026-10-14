package com.bencomester.vr_booking.service;

import com.bencomester.vr_booking.service.dto.AvailabilityDto;

import java.util.List;

public interface AvailabilityService {
    List<AvailabilityDto> findAll();
    AvailabilityDto findById(Long id);
    AvailabilityDto save(AvailabilityDto availabilityDto);
    AvailabilityDto update(Long id, AvailabilityDto availabilityDto);
    void deleteById(Long id);
}
