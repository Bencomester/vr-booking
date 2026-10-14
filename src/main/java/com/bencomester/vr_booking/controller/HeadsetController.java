package com.bencomester.vr_booking.controller;

import com.bencomester.vr_booking.entity.HeadsetEntity;
import com.bencomester.vr_booking.repository.HeadsetRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/headsets")
public class HeadsetController {

    private final HeadsetRepository headsetRepository;

    public HeadsetController(HeadsetRepository headsetRepository) {
        this.headsetRepository = headsetRepository;
    }
    
    @GetMapping
    public List<HeadsetEntity> getAllHeadsets() {
        return headsetRepository.findAll();
    }

    @PostMapping
    public HeadsetEntity createHeadset(@RequestBody HeadsetEntity headset) {
        return headsetRepository.save(headset);
    }
}