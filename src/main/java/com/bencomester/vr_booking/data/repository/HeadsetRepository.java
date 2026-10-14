package com.bencomester.vr_booking.data.repository;

import com.bencomester.vr_booking.data.entity.HeadsetEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HeadsetRepository extends JpaRepository<HeadsetEntity, Long> { }
