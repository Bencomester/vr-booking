package com.bencomester.vr_booking.service.impl;

import com.bencomester.vr_booking.data.entity.HeadsetEntity;
import com.bencomester.vr_booking.data.enums.HeadsetStatus;
import com.bencomester.vr_booking.data.enums.ReservationStatus;
import com.bencomester.vr_booking.data.repository.HeadsetRepository;
import com.bencomester.vr_booking.service.TimetableService;
import com.bencomester.vr_booking.service.dto.TimetableResponseDto;
import com.bencomester.vr_booking.service.dto.TimetableResponseDto.*;
import com.bencomester.vr_booking.data.entity.AvailabilityEntity;
import com.bencomester.vr_booking.data.entity.ReservationEntity;
import com.bencomester.vr_booking.data.repository.AvailabilityRepository;
import com.bencomester.vr_booking.data.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TimetableServiceImpl implements TimetableService {

    private final AvailabilityRepository availabilityRepository;
    private final ReservationRepository reservationRepository;
    private final HeadsetRepository headsetRepository;

    @Override
    @Transactional(readOnly = true)
    public TimetableResponseDto getAvailableTimetable() {
        List<AvailabilityEntity> rawAvailabilities = availabilityRepository.findAll();
        if (rawAvailabilities.isEmpty()) {
            log.debug("No availability windows found; returning empty timetable");
            return new TimetableResponseDto(List.of());
        }

        rawAvailabilities.sort(Comparator.comparing(AvailabilityEntity::getStartTime));
        List<TimeBlock> availabilities = mergeRawAvailabilities(rawAvailabilities);
        availabilities = splitBlocksByDay(availabilities);
        availabilities = subtractReservationsFromMerged(availabilities);

        List<TimeBlock> futureBlocks = filterOutPastBlocks(availabilities);
        log.debug("Computed timetable with {} available time blocks", futureBlocks.size());
        return new TimetableResponseDto(futureBlocks);
    }

    private List<TimeBlock> splitBlocksByDay(List<TimeBlock> blocks) {
        List<TimeBlock> dailyBlocks = new ArrayList<>();
        for (TimeBlock block : blocks) {
            LocalDateTime cursor = block.getStartTime();
            LocalDateTime end = block.getEndTime();
            while (cursor.toLocalDate().isBefore(end.toLocalDate())) {
                LocalDateTime endOfDay = cursor.toLocalDate().atTime(23, 59);
                if (Duration.between(cursor, endOfDay).toMinutes() >= MIN_RESERVATION_LENGTH_IN_MINUTES) {
                    dailyBlocks.add(new TimeBlock(cursor, endOfDay, block.getHeadsetId()));
                }
                cursor = cursor.toLocalDate().plusDays(1).atStartOfDay();
            }
            if (Duration.between(cursor, end).toMinutes() >= MIN_RESERVATION_LENGTH_IN_MINUTES) {
                dailyBlocks.add(new TimeBlock(cursor, end, block.getHeadsetId()));
            }
        }
        return dailyBlocks;
    }

    private List<TimeBlock> filterOutPastBlocks(List<TimeBlock> availabilities) {
        LocalDateTime rawNow = LocalDateTime.now().truncatedTo(ChronoUnit.MINUTES);
        int minute = rawNow.getMinute();
        int remainder = minute % 15;
        LocalDateTime roundedNow = remainder == 0 ? rawNow : rawNow.plusMinutes(15 - remainder);

        List<TimeBlock> result = new ArrayList<>();
        for (TimeBlock block : availabilities) {
            if (!block.getEndTime().isAfter(roundedNow)) {
                continue;
            }
            LocalDateTime effectiveStart = block.getStartTime().isBefore(roundedNow) ? roundedNow : block.getStartTime();
            if (Duration.between(effectiveStart, block.getEndTime()).toMinutes() >= MIN_RESERVATION_LENGTH_IN_MINUTES) {
                result.add(new TimeBlock(effectiveStart, block.getEndTime(), block.getHeadsetId()));
            }
        }
        return result;
    }

    private List<TimeBlock> subtractReservationsFromMerged(List<TimeBlock> mergedAvailabilities) {
        List<TimeBlock> availableTimeBlocks = new ArrayList<>();

        for (HeadsetEntity headset : getAvailableHeadsets()) {
            List<ReservationEntity> headsetReservations = reservationRepository
                    .findAllByHeadset_idAndStatusNot(headset.getId(), ReservationStatus.CANCELLED);
            headsetReservations.sort(Comparator.comparing(ReservationEntity::getStartTime));

            for (TimeBlock avail : mergedAvailabilities) {
                var cursor = avail.getStartTime();
                var windowEnd = avail.getEndTime();

                for (ReservationEntity res : headsetReservations) {
                    if (!res.getEndTime().isAfter(cursor) || !res.getStartTime().isBefore(windowEnd)) {
                        continue;
                    }
                    if (res.getStartTime().isAfter(cursor)) {
                        addIfLongEnough(availableTimeBlocks, cursor, res.getStartTime(), headset.getId());
                    }
                    if (res.getEndTime().isAfter(cursor)) {
                        cursor = res.getEndTime();
                    }
                }

                if (cursor.isBefore(windowEnd)) {
                    addIfLongEnough(availableTimeBlocks, cursor, windowEnd, headset.getId());
                }
            }
        }

        return availableTimeBlocks;
    }

    private List<HeadsetEntity> getAvailableHeadsets() {
        return headsetRepository.findAll().stream()
                .filter(h -> h.getStatus() == HeadsetStatus.AVAILABLE)
                .toList();
    }

    private List<TimeBlock> mergeRawAvailabilities(List<AvailabilityEntity> rawAvailabilities) {
        List<TimeBlock> mergedAvailabilities = new ArrayList<>();
        TimeBlock current = getTimeBlock(rawAvailabilities.getFirst());

        for (int i = 1; i < rawAvailabilities.size(); i++) {
            AvailabilityEntity next = rawAvailabilities.get(i);
            if (!next.getStartTime().isAfter(current.getEndTime())) {
                if (next.getEndTime().isAfter(current.getEndTime())) {
                    current.setEndTime(next.getEndTime());
                }
            } else {
                mergedAvailabilities.add(current);
                current = new TimeBlock(next.getStartTime(), next.getEndTime(), null);
            }
        }
        mergedAvailabilities.add(current);
        return mergedAvailabilities;
    }

    private TimeBlock getTimeBlock(AvailabilityEntity avail) {
        return new TimeBlock(
                avail.getStartTime(),
                avail.getEndTime(),
                null
        );
    }

    private void addIfLongEnough(List<TimeBlock> list, LocalDateTime start, LocalDateTime end, Long headsetId) {
        if (Duration.between(start, end).toMinutes() >= MIN_RESERVATION_LENGTH_IN_MINUTES) {
            list.add(new TimeBlock(start, end, headsetId));
        }
    }
}