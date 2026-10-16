package com.bencomester.vr_booking.data.repository;

import com.bencomester.vr_booking.data.entity.HeadsetEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HeadsetRepository extends JpaRepository<HeadsetEntity, Long> {
    Optional<HeadsetEntity> findByName(String name);
}
