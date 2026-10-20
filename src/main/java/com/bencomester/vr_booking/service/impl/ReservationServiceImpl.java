package com.bencomester.vr_booking.service.impl;

import com.bencomester.vr_booking.data.entity.HeadsetEntity;
import com.bencomester.vr_booking.data.entity.ReservationEntity;
import com.bencomester.vr_booking.data.entity.UserEntity;
import com.bencomester.vr_booking.data.enums.HeadsetStatus;
import com.bencomester.vr_booking.data.enums.ReservationStatus;
import com.bencomester.vr_booking.data.enums.UserRole;
import com.bencomester.vr_booking.data.repository.HeadsetRepository;
import com.bencomester.vr_booking.data.repository.ReservationRepository;
import com.bencomester.vr_booking.data.repository.UserRepository;
import com.bencomester.vr_booking.service.ReservationService;
import com.bencomester.vr_booking.service.TimetableService;
import com.bencomester.vr_booking.service.dto.ReservationCreateDto;
import com.bencomester.vr_booking.service.dto.ReservationDto;
import com.bencomester.vr_booking.service.mapper.ReservationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final TimetableService timetableService;
    private final HeadsetRepository headsetRepository;
    private final UserRepository userRepository;
    private final ReservationMapper reservationMapper;

    @Override
    public ReservationDto makeReservation(ReservationCreateDto reservationDto, String userEmail) {
        testMinimumDuration(reservationDto.getStartTime(), reservationDto.getEndTime());

        HeadsetEntity headsetEntity = getHeadsetEntityOrThrow(reservationDto.getHeadsetId());

        testHeadsetAvailability(reservationDto.getStartTime(), reservationDto.getEndTime(), reservationDto.getHeadsetId());

        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ReservationEntity reservation = new ReservationEntity(
                null,
                user,
                headsetEntity,
                reservationDto.getStartTime(),
                reservationDto.getEndTime(),
                ReservationStatus.CONFIRMED);

        return reservationMapper.toDto(reservationRepository.save(reservation));
    }

    private void testMinimumDuration(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null || Duration.between(start, end).toMinutes() < TimetableService.MIN_RESERVATION_LENGTH_IN_MINUTES) {
            throw new IllegalArgumentException("Reservation must be at least 30 minutes long.");
        }
    }

    private HeadsetEntity getHeadsetEntityOrThrow(Long headsetId) {
        HeadsetEntity headsetEntity = headsetRepository.findById(headsetId)
                .orElseThrow(() -> new IllegalArgumentException("Headset not found."));

        if(headsetEntity.getStatus().equals(HeadsetStatus.AVAILABLE)) return headsetEntity;

        throw new IllegalArgumentException("Headset is currently unavailable.");
    }

    private void testHeadsetAvailability(LocalDateTime start, LocalDateTime end, Long headsetId) {
        boolean fitsInAvailableBlock = timetableService.getAvailableTimetable()
                .getAvailableTimes()
                .stream()
                .filter(block -> block.getHeadsetId().equals(headsetId))
                .anyMatch(block -> !start.isBefore(block.getStartTime()) && !end.isAfter(block.getEndTime()));

        if (!fitsInAvailableBlock) throw new IllegalArgumentException("This time is not available.");
    }

    @Override
    public ReservationDto cancelReservation(Long reservationId, String userEmail) {
        UserEntity caller = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        return updateStatus(reservationId, ReservationStatus.CANCELLED, caller.getId());
    }

    @Override
    public List<ReservationDto> findAll() {
        return reservationMapper.toDto(reservationRepository.findAll());
    }

    @Override
    public ReservationDto findById(Long id) {
        return reservationRepository.findById(id)
                .map(reservationMapper::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found."));
    }

    @Override
    public ReservationDto updateStatus(Long id, ReservationStatus status) {
        ReservationEntity reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found."));
        return updateStatus(reservation, status);
    }

    private ReservationDto updateStatus(Long id, ReservationStatus status, Long userId) {
        ReservationEntity reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found."));

        if (!reservation.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You can only cancel your own reservations.");
        }

        return updateStatus(reservation, status);
    }

    private ReservationDto updateStatus(ReservationEntity reservation, ReservationStatus status) {
        reservation.setStatus(status);
        return reservationMapper.toDto(reservationRepository.save(reservation));
    }

    @Override
    public void deleteById(Long id) {
        reservationRepository.deleteById(id);
    }
}
