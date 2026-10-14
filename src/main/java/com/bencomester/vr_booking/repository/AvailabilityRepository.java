package com.bencomester.vr_booking.repository;

import com.bencomester.vr_booking.entity.AvailabilityEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AvailabilityRepository extends JpaRepository<AvailabilityEntity, Long> { }