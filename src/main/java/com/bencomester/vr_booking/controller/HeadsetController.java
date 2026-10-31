package com.bencomester.vr_booking.controller;

import com.bencomester.vr_booking.service.HeadsetService;
import com.bencomester.vr_booking.service.dto.HeadsetDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/headset")
@RequiredArgsConstructor
public class HeadsetController {

    private final HeadsetService headsetService;

    @GetMapping
    public List<HeadsetDto> getAllHeadsets() {
        return headsetService.findAll();
    }

    @GetMapping("/{id}")
    public HeadsetDto getHeadsetById(@PathVariable Long id) {
        return headsetService.findById(id);
    }

    @PostMapping
    public HeadsetDto createHeadset(@Valid @RequestBody HeadsetDto headsetDto) {
        return headsetService.save(headsetDto);
    }

    @PutMapping("/{id}")
    public HeadsetDto updateHeadset(@PathVariable Long id, @Valid @RequestBody HeadsetDto dto) {
        return headsetService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void deleteHeadset(@PathVariable Long id) {
        headsetService.deleteById(id);
    }
}