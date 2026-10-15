package com.bencomester.vr_booking.data.repository;

import com.bencomester.vr_booking.data.entity.ReservationEntity;
import com.bencomester.vr_booking.data.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<ReservationEntity, Long> {
    List<ReservationEntity> findAllByStatusNot(ReservationStatus status);
    List<ReservationEntity> findAllByHeadset_idAndStatusNot(Long headsetId, ReservationStatus status);
    List<ReservationEntity> findAllByUser_id(Long userId);
}
