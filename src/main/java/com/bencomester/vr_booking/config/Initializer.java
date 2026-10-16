package com.bencomester.vr_booking.config;

import com.bencomester.vr_booking.data.entity.GameEntity;
import com.bencomester.vr_booking.data.entity.HeadsetEntity;
import com.bencomester.vr_booking.data.entity.RoleEntity;
import com.bencomester.vr_booking.data.entity.UserEntity;
import com.bencomester.vr_booking.data.enums.HeadsetStatus;
import com.bencomester.vr_booking.data.enums.UserRole;
import com.bencomester.vr_booking.data.repository.HeadsetRepository;
import com.bencomester.vr_booking.data.repository.RoleRepository;
import com.bencomester.vr_booking.data.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashSet;

@Component
@RequiredArgsConstructor
public class Initializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final HeadsetRepository headsetRepository;

    @Override
    public void run(String... args) {
        roleRepository.findByName(UserRole.USER)
                .orElseGet(() -> roleRepository.save(new RoleEntity(null, UserRole.USER)));

        RoleEntity adminRole = roleRepository.findByName(UserRole.ADMIN)
                .orElseGet(() -> roleRepository.save(new RoleEntity(null, UserRole.ADMIN)));

        if (!userRepository.existsByEmail("admin@test.vr")) {
            UserEntity admin = new UserEntity(
                    null,
                    "admin@test.vr",
                    passwordEncoder.encode("admin123"),
                    "John Smith",
                    "000000000",
                    LocalDateTime.now(),
                    adminRole
            );
            userRepository.save(admin);
        }

        headsetRepository.findByName("Valve Index").orElseGet(() -> headsetRepository.save(
                new HeadsetEntity(null,
                        "Valve Index",
                        15d,
                        HeadsetStatus.AVAILABLE,
                        new HashSet<>())));

        headsetRepository.findByName("Steam Frame").orElseGet(() -> headsetRepository.save(
                new HeadsetEntity(null,
                        "Steam Frame",
                        20d,
                        HeadsetStatus.COMING_SOON,
                        new HashSet<>())));
    }
}
