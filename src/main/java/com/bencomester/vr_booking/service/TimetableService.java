package com.bencomester.vr_booking.service;

import com.bencomester.vr_booking.service.dto.TimetableResponseDto;
import com.bencomester.vr_booking.service.dto.TimetableResponseDto.*;
import com.bencomester.vr_booking.data.entity.AvailabilityEntity;
import com.bencomester.vr_booking.data.entity.ReservationEntity;
import com.bencomester.vr_booking.data.repository.AvailabilityRepository;
import com.bencomester.vr_booking.data.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TimetableService {

    private final AvailabilityRepository availabilityRepository;
    private final ReservationRepository reservationRepository;

    //TODO: Clean up this function
    public TimetableResponseDto getVisualTimetable() {
        List<AvailabilityEntity> availabilities = availabilityRepository.findAll();
        List<ReservationEntity> activeReservations = reservationRepository.findAllByStatusNot("CANCELLED");
        activeReservations.sort(Comparator.comparing(ReservationEntity::getStartTime));

        List<TimeBlock> freeGreenBlocks = new ArrayList<>();


        for (AvailabilityEntity avail : availabilities) {
            var cursor = avail.getStartTime();
            var windowEnd = avail.getEndTime();

            for (ReservationEntity res : activeReservations) {

                if (!res.getEndTime().isAfter(cursor) || !res.getStartTime().isBefore(windowEnd)) {
                    continue;
                }

                if (res.getStartTime().isAfter(cursor)) {
                    freeGreenBlocks.add(new TimeBlock(cursor, res.getStartTime(), null));
                }

                if (res.getEndTime().isAfter(cursor)) {
                    cursor = res.getEndTime();
                }
            }
            if (cursor.isBefore(windowEnd)) {
                freeGreenBlocks.add(new TimeBlock(cursor, windowEnd, null));
            }
        }

        List<TimeBlock> reservedRedBlocks = activeReservations.stream()
                .map(r -> new TimeBlock(r.getStartTime(), r.getEndTime(), r.getHeadset().getId()))
                .toList();

        return new TimetableResponseDto(freeGreenBlocks, reservedRedBlocks);
    }
}