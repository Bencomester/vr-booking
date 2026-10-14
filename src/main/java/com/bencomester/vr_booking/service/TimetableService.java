package com.bencomester.vr_booking.service;

import com.bencomester.vr_booking.dto.TimetableResponseDto;
import com.bencomester.vr_booking.entity.AvailabilityEntity;
import com.bencomester.vr_booking.entity.ReservationEntity;
import com.bencomester.vr_booking.repository.AvailabilityRepository;
import com.bencomester.vr_booking.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimetableService {

    private final AvailabilityRepository availabilityRepository;
    private final ReservationRepository reservationRepository;

    public TimetableResponseDto getVisualTimetable() {
        List<AvailabilityEntity> availabilities = availabilityRepository.findAll();
        List<TimetableResponseDto.TimeBlock> availableBlocks = availabilities.stream()
                .map(a -> new TimetableResponseDto.TimeBlock(a.getStartTime(), a.getEndTime(), null))
                .collect(Collectors.toList());

        List<ReservationEntity> reservations = reservationRepository.findAll();
        List<TimetableResponseDto.TimeBlock> reservedBlocks = reservations.stream()
                .filter(r -> !r.getStatus().equals("CANCELLED"))
                .map(r -> new TimetableResponseDto.TimeBlock(r.getStartTime(), r.getEndTime(), r.getHeadset().getId()))
                .collect(Collectors.toList());

        return new TimetableResponseDto(availableBlocks, reservedBlocks);
    }
}