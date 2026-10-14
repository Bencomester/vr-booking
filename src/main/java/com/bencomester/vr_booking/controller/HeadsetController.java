package com.bencomester.vr_booking.controller;

import com.bencomester.vr_booking.entity.HeadsetEntity;
import com.bencomester.vr_booking.repository.HeadsetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/headset")
@RequiredArgsConstructor
public class HeadsetController {

    private final HeadsetRepository headsetRepository;

    @GetMapping
    public List<HeadsetEntity> getAllHeadsets() {
        return headsetRepository.findAll();
    }

    @GetMapping("/id")
    public HeadsetEntity getHeadsetById(@RequestParam Long id) {
        return headsetRepository.findById(id).orElse(new HeadsetEntity());
    }

    @PostMapping
    public HeadsetEntity createHeadset(@RequestBody HeadsetEntity headset) {
        return headsetRepository.save(headset);
    }
}