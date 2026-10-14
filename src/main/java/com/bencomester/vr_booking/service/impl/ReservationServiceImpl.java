package com.bencomester.vr_booking.service.impl;

import com.bencomester.vr_booking.data.entity.HeadsetEntity;
import com.bencomester.vr_booking.data.entity.ReservationEntity;
import com.bencomester.vr_booking.data.entity.UserEntity;
import com.bencomester.vr_booking.data.repository.AvailabilityRepository;
import com.bencomester.vr_booking.data.repository.HeadsetRepository;
import com.bencomester.vr_booking.data.repository.ReservationRepository;
import com.bencomester.vr_booking.data.repository.UserRepository;
import com.bencomester.vr_booking.service.ReservationService;
import com.bencomester.vr_booking.service.dto.ReservationCreateDto;
import com.bencomester.vr_booking.service.dto.ReservationDto;
import com.bencomester.vr_booking.service.mapper.ReservationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {

    private static final int MIN_RESERVATION_LENGTH_IN_MINUTES = 30;

    private final ReservationRepository reservationRepository;
    private final AvailabilityRepository availabilityRepository;
    private final HeadsetRepository headsetRepository;
    private final UserRepository userRepository;
    private final ReservationMapper reservationMapper;

    @Override
    public ReservationDto makeReservation(ReservationCreateDto reservationDto) {
        testMinimumDuration(reservationDto.getStartTime(), reservationDto.getEndTime());

        HeadsetEntity headsetEntity = getHeadsetEntityOrThrow(reservationDto.getHeadsetId());

        testHeadsetAvailability(reservationDto.getStartTime(), reservationDto.getEndTime(), reservationDto.getHeadsetId());

        UserEntity user = userRepository.findById(reservationDto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ReservationEntity reservation = new ReservationEntity(null, user, headsetEntity, reservationDto.getStartTime(), reservationDto.getEndTime(), "CONFIRMED");

        return reservationMapper.toDto(reservationRepository.save(reservation));
    }

    private void testMinimumDuration(LocalDateTime start, LocalDateTime end) {
        long minutes = Duration.between(start, end).toMinutes();
        if (minutes < MIN_RESERVATION_LENGTH_IN_MINUTES) {
            throw new IllegalArgumentException("Reservation must be at least 30 minutes long.");
        }
    }

    private HeadsetEntity getHeadsetEntityOrThrow(Long headsetId) {
        HeadsetEntity headsetEntity = headsetRepository.findById(headsetId)
                .orElseThrow(() -> new IllegalArgumentException("Headset not found."));

        if("AVAILABLE".equalsIgnoreCase(headsetEntity.getStatus())) return headsetEntity;

        throw new IllegalArgumentException("Headset is currently unavailable.");
    }

    private void testHeadsetAvailability(LocalDateTime start, LocalDateTime end, Long headsetId) {
        boolean isOpen = availabilityRepository.findAll().stream()
                .anyMatch(a -> !start.isBefore(a.getStartTime()) && !end.isAfter(a.getEndTime()));

        boolean overlaps = reservationRepository.findAllByHeadset_idAndStatusNot(headsetId, "CANCELLED")
                .stream().anyMatch(a -> start.isBefore(a.getEndTime()) && end.isAfter(a.getStartTime()));

        if (!isOpen || overlaps) throw new IllegalArgumentException("This time slot overlaps with an existing reservation.");
    }

    @Override
    public ReservationDto cancelReservation(Long reservationId) {
        return updateStatus(reservationId, "CANCELLED");
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
    public ReservationDto updateStatus(Long id, String status) {
        ReservationEntity reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found."));
        reservation.setStatus(status);
        return reservationMapper.toDto(reservationRepository.save(reservation));
    }

    @Override
    public void deleteById(Long id) {
        reservationRepository.deleteById(id);
    }
}
