package com.bencomester.vr_booking.data.repository;

import com.bencomester.vr_booking.data.entity.AvailabilityEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AvailabilityRepository extends JpaRepository<AvailabilityEntity, Long> { }