package com.bencomester.vr_booking.repository;

import com.bencomester.vr_booking.entity.HeadsetEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HeadsetRepository extends JpaRepository<HeadsetEntity, Long> { }
