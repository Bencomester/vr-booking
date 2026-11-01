package com.bencomester.vr_booking.config;

import com.bencomester.vr_booking.data.entity.*;
import com.bencomester.vr_booking.data.enums.HeadsetStatus;
import com.bencomester.vr_booking.data.enums.UserRole;
import com.bencomester.vr_booking.data.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class Initializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final HeadsetRepository headsetRepository;
    private final AvailabilityRepository availabilityRepository;
    private final GameRepository gameRepository;
    private final RigRepository rigRepository;

    @Value("${app.seed.enabled}")
    private boolean seedEnabled;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(String... args) {
        roleRepository.findByName(UserRole.USER)
                .orElseGet(() -> roleRepository.save(new RoleEntity(null, UserRole.USER)));
        log.info("Database initialization check completed (seedEnabled=true)");

        RoleEntity adminRole = roleRepository.findByName(UserRole.ADMIN)
                .orElseGet(() -> roleRepository.save(new RoleEntity(null, UserRole.ADMIN)));

        if (!userRepository.existsByEmail(adminEmail)) {
            UserEntity admin = new UserEntity(
                    null,
                    adminEmail,
                    passwordEncoder.encode(adminPassword),
                    "John Smith",
                    "+36 30 555 0199",
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
                    LocalDateTime.now(),
                    adminRole
            );
            userRepository.save(admin);
        }
    }

        if (!seedEnabled) return;

        List<GameEntity> existingGames = gameRepository.findAll();
        if (existingGames.isEmpty()) {
            GameEntity alyx = gameRepository.save(new GameEntity(
                    null,
                    "Half-Life: Alyx",
                    "Valve's visceral VR return to the Half-Life series. Fight a vicious alien race known as the Combine in City 17.",
                    546560,
                    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/546560/header.jpg"
            ));
            GameEntity beatSaber = gameRepository.save(new GameEntity(
                    null,
                    "Beat Saber",
                    "VR rhythm game where you slash the beats of adrenaline-pumping music as they fly towards you.",
                    620980,
                    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/620980/header.jpg"
            ));
            GameEntity superhot = gameRepository.save(new GameEntity(
                    null,
                    "SUPERHOT VR",
                    "Time moves only when you move. Catch weapons mid-air and slice through a hurricane of slow-motion bullets.",
                    617830,
                    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/617830/header.jpg"
            ));
            existingGames = List.of(alyx, beatSaber, superhot);
        }

        Set<GameEntity> defaultGames = new HashSet<>(existingGames);

        headsetRepository.findByName("Valve Index").ifPresentOrElse(
                h -> {
                    if (h.getHourlyPrice() != null && h.getHourlyPrice() < 500) {
                        h.setHourlyPrice(5500d);
                    }
                    if (h.getDescription() == null) {
                        h.setDescription("High-precision Lighthouse 2.0 base-station tracking, 144Hz dual-element optics, and Knuckles finger-tracking controllers.");
                    }
                    if (h.getImageUrl() == null) {
                        h.setImageUrl("https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=900&q=80");
                    }
                    if (h.getInstalledGames().isEmpty()) {
                        h.setInstalledGames(defaultGames);
                    }
                    headsetRepository.save(h);
                },
                () -> headsetRepository.save(new HeadsetEntity(
                        null,
                        "Valve Index",
                        5500d,
                        HeadsetStatus.AVAILABLE,
                        "High-precision Lighthouse 2.0 base-station tracking, 144Hz dual-element optics, and Knuckles finger-tracking controllers.",
                        "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=900&q=80",
                        defaultGames
                ))
        );

        headsetRepository.findByName("Steam Frame").ifPresentOrElse(
                h -> {
                    if (h.getHourlyPrice() != null && h.getHourlyPrice() < 500) {
                        h.setHourlyPrice(7500d);
                    }
                    if (h.getDescription() == null) {
                        h.setDescription("Next-generation wireless micro-OLED flagship with eye-tracked foveated rendering and ultra-wide field of view.");
                    }
                    if (h.getImageUrl() == null) {
                        h.setImageUrl("https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?auto=format&fit=crop&w=900&q=80");
                    }
                    headsetRepository.save(h);
                },
                () -> headsetRepository.save(new HeadsetEntity(
                        null,
                        "Steam Frame",
                        7500d,
                        HeadsetStatus.COMING_SOON,
                        "Next-generation wireless micro-OLED flagship with eye-tracked foveated rendering and ultra-wide field of view.",
                        "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?auto=format&fit=crop&w=900&q=80",
                        new HashSet<>()
                ))
        );

        if (rigRepository.findAll().isEmpty()) {
            rigRepository.save(new RigEntity(
                    null,
                    "Apex Hyperion X1",
                    "AMD Ryzen 7 9800X3D",
                    "NVIDIA GeForce RTX 5090 32GB",
                    "64GB DDR5 6400MHz",
                    "Windows 11 Pro 24H2 (VR Tuned)",
                    "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80",
                    "Liquid-cooled flagship arena rig engineered for zero-reprojection 144Hz supersampled VR gaming."
            ));
            rigRepository.save(new RigEntity(
                    null,
                    "Nebula Pulse S2",
                    "AMD Ryzen 7 7800X3D",
                    "NVIDIA GeForce RTX 4080 Super 16GB",
                    "32GB DDR5 6000MHz",
                    "Windows 11 Pro / SteamOS Dual-Boot",
                    "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=900&q=80",
                    "High-airflow tournament station with dedicated Wi-Fi 7 6GHz VR streaming link and low-latency USB4 fiber tether."
            ));
        }

        if (availabilityRepository.findAll().isEmpty()) {
            LocalDate monday = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            for (int i = 0; i < 14; i++) {
                LocalDate day = monday.plusDays(i);
                availabilityRepository.save(new AvailabilityEntity(
                        null,
                        day.atTime(9, 0),
                        day.atTime(22, 0)
                ));
            }
        }
    }
}
