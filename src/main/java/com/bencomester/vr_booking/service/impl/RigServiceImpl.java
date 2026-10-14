package com.bencomester.vr_booking.service.impl;

import com.bencomester.vr_booking.data.entity.RigEntity;
import com.bencomester.vr_booking.data.repository.RigRepository;
import com.bencomester.vr_booking.service.RigService;
import com.bencomester.vr_booking.service.dto.RigDto;
import com.bencomester.vr_booking.service.mapper.RigMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RigServiceImpl implements RigService {

    private final RigRepository rigRepository;
    private final RigMapper rigMapper;

    @Override
    public List<RigDto> findAll() {
        return rigMapper.toDto(rigRepository.findAll());
    }

    @Override
    public RigDto findById(Long id) {
        return rigRepository.findById(id)
                .map(rigMapper::toDto)
                .orElseThrow(() -> new IllegalArgumentException("No Rig found with id: " + id));
    }

    @Override
    public RigDto save(RigDto rigDto) {
        RigEntity rigEntity = rigMapper.toEntity(rigDto);
        return rigMapper.toDto(rigRepository.save(rigEntity));
    }

    @Override
    public RigDto update(Long id, RigDto rigDto) {
        RigEntity existing = rigRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No Rig found with id: " + id));
        existing.setName(rigDto.getName());
        existing.setCpu(rigDto.getCpu());
        existing.setGpu(rigDto.getGpu());
        existing.setRam(rigDto.getRam());
        existing.setDescription(rigDto.getDescription());
        return rigMapper.toDto(rigRepository.save(existing));
    }

    @Override
    public void deleteById(Long id) {
        rigRepository.deleteById(id);
    }
}
