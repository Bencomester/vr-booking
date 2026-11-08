package com.bencomester.vr_booking.service.impl;

import com.bencomester.vr_booking.data.entity.AvailabilityEntity;
import com.bencomester.vr_booking.data.entity.HeadsetEntity;
import com.bencomester.vr_booking.data.entity.ReservationEntity;
import com.bencomester.vr_booking.data.enums.HeadsetStatus;
import com.bencomester.vr_booking.data.enums.ReservationStatus;
import com.bencomester.vr_booking.data.repository.AvailabilityRepository;
import com.bencomester.vr_booking.data.repository.HeadsetRepository;
import com.bencomester.vr_booking.data.repository.ReservationRepository;
import com.bencomester.vr_booking.service.TimetableService;
import com.bencomester.vr_booking.service.dto.TimetableResponseDto;
import com.bencomester.vr_booking.service.dto.TimetableResponseDto.TimeBlock;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
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
                LocalDateTime endOfDay = cursor.toLocalDate().atTime(23, 45);
                addIfLongEnough(dailyBlocks, cursor, endOfDay, block.getHeadsetId());
                cursor = cursor.toLocalDate().plusDays(1).atStartOfDay();
            }
            addIfLongEnough(dailyBlocks, cursor, end, block.getHeadsetId());
        }
        return dailyBlocks;
    }

    private List<TimeBlock> filterOutPastBlocks(List<TimeBlock> availabilities) {
        LocalDateTime rawNow = LocalDateTime.now(ZoneId.systemDefault()).truncatedTo(ChronoUnit.MINUTES);
        int minute = rawNow.getMinute();
        int remainder = minute % 15;
        LocalDateTime roundedNow = remainder == 0 ? rawNow : rawNow.plusMinutes(15L - remainder);

        List<TimeBlock> result = new ArrayList<>();
        for (TimeBlock block : availabilities) {
            if (!block.getEndTime().isAfter(roundedNow)) {
                continue;
            }
            LocalDateTime effectiveStart = block.getStartTime().isBefore(roundedNow)
                    ? roundedNow
                    : block.getStartTime();
            addIfLongEnough(result, effectiveStart, block.getEndTime(), block.getHeadsetId());
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
                appendFreeSlicesForWindow(availableTimeBlocks, avail, headsetReservations, headset.getId());
            }
        }
        return availableTimeBlocks;
    }

    private void appendFreeSlicesForWindow(
            List<TimeBlock> target,
            TimeBlock avail,
            List<ReservationEntity> reservations,
            Long headsetId) {
        LocalDateTime cursor = avail.getStartTime();
        LocalDateTime windowEnd = avail.getEndTime();

        for (ReservationEntity res : reservations) {
            if (!res.getEndTime().isAfter(cursor) || !res.getStartTime().isBefore(windowEnd)) {
                continue;
            }
            if (res.getStartTime().isAfter(cursor)) {
                addIfLongEnough(target, cursor, res.getStartTime(), headsetId);
            }
            if (res.getEndTime().isAfter(cursor)) {
                cursor = res.getEndTime();
            }
        }
        if (cursor.isBefore(windowEnd)) {
            addIfLongEnough(target, cursor, windowEnd, headsetId);
        }
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
        return new TimeBlock(avail.getStartTime(), avail.getEndTime(), null);
    }

    private void addIfLongEnough(List<TimeBlock> list, LocalDateTime start, LocalDateTime end, Long headsetId) {
        ZoneId zone = ZoneId.systemDefault();
        long minutes = Duration.between(start.atZone(zone), end.atZone(zone)).toMinutes();
        if (minutes >= MIN_RESERVATION_LENGTH_IN_MINUTES) {
            list.add(new TimeBlock(start, end, headsetId));
        }
    }
}