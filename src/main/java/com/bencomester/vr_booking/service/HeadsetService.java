package com.bencomester.vr_booking.service;

import com.bencomester.vr_booking.service.dto.HeadsetDto;

import java.util.List;

public interface HeadsetService {
    List<HeadsetDto> findAll();
    HeadsetDto findById(Long id);
    HeadsetDto save(HeadsetDto gameDto);
    HeadsetDto update(Long id, HeadsetDto gameDto);
    void deleteById(Long id);
}
