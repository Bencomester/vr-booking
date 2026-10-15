package com.bencomester.vr_booking.controller;

import com.bencomester.vr_booking.service.RigService;
import com.bencomester.vr_booking.service.dto.RigDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rig")
@RequiredArgsConstructor
public class RigController {
    
    private final RigService rigService;

    @GetMapping
    public List<RigDto> getAllRigs() {
        return rigService.findAll();
    }

    @GetMapping("/{id}")
    public RigDto getRigById(@PathVariable Long id) {
        return rigService.findById(id);
    }

    @PostMapping
    public RigDto createRig(@RequestBody RigDto dto) {
        return rigService.save(dto);
    }

    @PutMapping("/{id}")
    public RigDto updateRig(@PathVariable Long id, @RequestBody RigDto dto) {
        return rigService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void deleteRig(@PathVariable Long id) {
        rigService.deleteById(id);
    }
}
