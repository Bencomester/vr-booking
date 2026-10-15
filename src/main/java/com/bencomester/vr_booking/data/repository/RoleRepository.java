package com.bencomester.vr_booking.data.repository;

import com.bencomester.vr_booking.data.entity.RoleEntity;
import com.bencomester.vr_booking.data.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<RoleEntity, Long> {
    Optional<RoleEntity> findByName(UserRole name);
}
