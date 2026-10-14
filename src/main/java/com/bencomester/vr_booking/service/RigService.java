package com.bencomester.vr_booking.service;

import com.bencomester.vr_booking.service.dto.RigDto;

import java.util.List;

public interface RigService {
    List<RigDto> findAll();
    RigDto findById(Long id);
    RigDto save(RigDto rigDto);
    RigDto update(Long id, RigDto rigDto);
    void deleteById(Long id);
}
