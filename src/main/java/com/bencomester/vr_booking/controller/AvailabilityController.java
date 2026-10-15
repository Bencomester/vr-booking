package com.bencomester.vr_booking.controller;

import com.bencomester.vr_booking.service.AvailabilityService;
import com.bencomester.vr_booking.service.dto.AvailabilityDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @GetMapping
    public List<AvailabilityDto> getAllAvailabilities() {
        return availabilityService.findAll();
    }

    @GetMapping("/{id}")
    public AvailabilityDto getAvailabilityById(@PathVariable Long id) {
        return availabilityService.findById(id);
    }

    @PostMapping
    public AvailabilityDto createAvailability(@RequestBody AvailabilityDto availabilityDto) {
        return availabilityService.save(availabilityDto);
    }

    @PutMapping("/{id}")
    public AvailabilityDto updateAvailability(@PathVariable Long id, @RequestBody AvailabilityDto availabilityDto) {
        return availabilityService.update(id, availabilityDto);
    }

    @DeleteMapping("/{id}")
    public void deleteAvailability(@PathVariable Long id) {
        availabilityService.deleteById(id);
    }
}
