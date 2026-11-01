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
import com.bencomester.vr_booking.exception.ForbiddenOperationException;
import com.bencomester.vr_booking.exception.InvalidInputException;
import com.bencomester.vr_booking.exception.ResourceConflictException;
import com.bencomester.vr_booking.exception.ResourceNotFoundException;
import com.bencomester.vr_booking.service.ReservationService;
import com.bencomester.vr_booking.service.TimetableService;
import com.bencomester.vr_booking.service.dto.ReservationCreateDto;
import com.bencomester.vr_booking.service.dto.ReservationDto;
import com.bencomester.vr_booking.service.mapper.ReservationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {

    private static final int MAX_RESERVATION_LENGTH_IN_MINUTES = 240;

    private final ReservationRepository reservationRepository;
    private final TimetableService timetableService;
    private final HeadsetRepository headsetRepository;
    private final UserRepository userRepository;
    private final ReservationMapper reservationMapper;

    @Override
    @Transactional
    public ReservationDto makeReservation(ReservationCreateDto reservationDto, String userEmail) {
        LocalDateTime start = reservationDto.getStartTime();
        LocalDateTime end = reservationDto.getEndTime();
        log.info("User '{}' attempting reservation for headsetId={} ({} -> {})",
                userEmail, reservationDto.getHeadsetId(), start, end);

        validateReservationWindow(start, end);
        HeadsetEntity headsetEntity = getHeadsetEntityOrThrow(reservationDto.getHeadsetId());
        testHeadsetAvailability(start, end, reservationDto.getHeadsetId());

        UserEntity user = getCallerOrThrow(userEmail);

        ReservationEntity reservation = new ReservationEntity(
                null,
                user,
                headsetEntity,
                start,
                end,
                ReservationStatus.CONFIRMED);

        return reservationMapper.toDto(reservationRepository.save(reservation));
    }

    private void validateReservationWindow(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            throw new InvalidInputException("Start and end times are required.");
        }
        if (start.getSecond() != 0 || start.getNano() != 0 || end.getSecond() != 0 || end.getNano() != 0
                || start.getMinute() % 15 != 0 || end.getMinute() % 15 != 0) {
            throw new InvalidInputException("Reservations must be aligned to 15-minute intervals.");
        }
        ZoneId zone = ZoneId.systemDefault();
        long minutes = Duration.between(start.atZone(zone), end.atZone(zone)).toMinutes();
        if (minutes < TimetableService.MIN_RESERVATION_LENGTH_IN_MINUTES) {
            throw new InvalidInputException("Reservation must be at least 30 minutes long.");
        }
        if (minutes > MAX_RESERVATION_LENGTH_IN_MINUTES) {
            throw new InvalidInputException("Reservation cannot exceed 4 hours (240 minutes).");
        }
    }

    private HeadsetEntity getHeadsetEntityOrThrow(Long headsetId) {
        HeadsetEntity headsetEntity = headsetRepository.findByIdForUpdate(headsetId)
                .orElseThrow(() -> new ResourceNotFoundException("Headset not found with id: " + headsetId));

        if (headsetEntity.getStatus().equals(HeadsetStatus.AVAILABLE)) return headsetEntity;

        throw new ResourceConflictException("Headset '" + headsetEntity.getName() + "' is currently unavailable.");
    }

    private void testHeadsetAvailability(LocalDateTime start, LocalDateTime end, Long headsetId) {
        boolean fitsInAvailableBlock = timetableService.getAvailableTimetable()
                .getAvailableTimes()
                .stream()
                .filter(block -> block.getHeadsetId().equals(headsetId))
                .anyMatch(block -> !start.isBefore(block.getStartTime()) && !end.isAfter(block.getEndTime()));

        if (!fitsInAvailableBlock) {
            throw new ResourceConflictException("The requested time slot is not available.");
        }
    }

    @Override
    @Transactional
    public ReservationDto cancelReservation(Long reservationId, String userEmail) {
        UserEntity caller = getCallerOrThrow(userEmail);
        ReservationEntity reservation = getReservationOrThrow(reservationId);

        boolean isOwner = reservation.getUser().getId().equals(caller.getId());
        if (!isOwner && !isAdmin(caller)) {
            throw new ForbiddenOperationException("You can only cancel your own reservations.");
        }
        return updateStatus(reservation, ReservationStatus.CANCELLED);
        if (reservation.getStatus() == ReservationStatus.COMPLETED) {
            throw new ResourceConflictException("Completed reservations cannot be cancelled.");
        }

        return saveStatus(reservation, ReservationStatus.CANCELLED);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationDto> findAll(String userEmail) {
        UserEntity caller = getCallerOrThrow(userEmail);
        if (!isAdmin(caller)) {
            throw new ForbiddenOperationException("Only administrators can view all reservations.");
        }
        return reservationMapper.toDto(reservationRepository.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationDto> findAllByUser(String userEmail) {
        Long userId = getCallerOrThrow(userEmail).getId();
        List<ReservationDto> list = reservationMapper.toDto(reservationRepository.findAllByUser_id(userId));
        return list;
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationDto findById(Long id) {
        return reservationMapper.toDto(getReservationOrThrow(id));
    }

    @Override
    @Transactional
    public ReservationDto updateStatus(Long id, ReservationStatus status, String userEmail) {
        UserEntity caller = getCallerOrThrow(userEmail);
        if (!isAdmin(caller)) {
            throw new ForbiddenOperationException("Only administrators can update reservation status.");
        }

        ReservationEntity reservation = getReservationOrThrow(id);
        if (reservation.getStatus() == ReservationStatus.CANCELLED && status != ReservationStatus.CANCELLED) {
            getHeadsetEntityOrThrow(reservation.getHeadset().getId());
            testHeadsetAvailability(reservation.getStartTime(), reservation.getEndTime(), reservation.getHeadset().getId());
        }

    private ReservationDto updateStatus(ReservationEntity reservation, ReservationStatus status) {
        return saveStatus(reservation, status);
    }

    private ReservationDto saveStatus(ReservationEntity reservation, ReservationStatus status) {
        reservation.setStatus(status);
        return reservationMapper.toDto(reservationRepository.save(reservation));
    }

    private UserEntity getCallerOrThrow(String userEmail) {
        return userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
    }

    private ReservationEntity getReservationOrThrow(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));
    }

    private boolean isAdmin(UserEntity user) {
        return user.getRole() != null && user.getRole().getName() == UserRole.ADMIN;
    }

    @Override
    @Transactional
    public void deleteById(Long id, String userEmail) {
        if (!isAdmin(getCallerOrThrow(userEmail))) {
            throw new ForbiddenOperationException("You have to be an administrator to remove a reservation.");
        }

        if (!reservationRepository.existsById(id)) {
            throw new ResourceNotFoundException("No Reservation found with id: " + id);
        }

        reservationRepository.deleteById(id);
    }
}
