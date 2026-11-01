package com.bencomester.vr_booking.service.impl;

import com.bencomester.vr_booking.config.AllowedAvatars;
import com.bencomester.vr_booking.config.CustomUserDetailsService;
import com.bencomester.vr_booking.config.JwtService;
import com.bencomester.vr_booking.data.entity.RoleEntity;
import com.bencomester.vr_booking.data.entity.UserEntity;
import com.bencomester.vr_booking.data.enums.UserRole;
import com.bencomester.vr_booking.data.repository.ReservationRepository;
import com.bencomester.vr_booking.data.repository.RoleRepository;
import com.bencomester.vr_booking.data.repository.UserRepository;
import com.bencomester.vr_booking.exception.InvalidInputException;
import com.bencomester.vr_booking.exception.ResourceConflictException;
import com.bencomester.vr_booking.exception.ResourceNotFoundException;
import com.bencomester.vr_booking.service.UserService;
import com.bencomester.vr_booking.service.dto.*;
import com.bencomester.vr_booking.service.mapper.ReservationMapper;
import com.bencomester.vr_booking.service.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private static final String USER_NOT_FOUND_MSG = "User not found.";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ReservationRepository reservationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final UserMapper userMapper;
    private final ReservationMapper reservationMapper;

    @Override
    @Transactional
    public AuthResponseDto register(RegisterRequestDto registerRequestDto) {
        String normalizedEmail = registerRequestDto.getEmail().trim().toLowerCase(Locale.ROOT);
        log.info("Registration attempt for email='{}'", normalizedEmail);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ResourceConflictException("This email address is already in use.");
        }
        RoleEntity userRole = roleRepository.findByName(UserRole.USER)
                .orElseGet(() -> roleRepository.save(new RoleEntity(null, UserRole.USER)));

        UserEntity user = new UserEntity();
        user.setFullName(registerRequestDto.getFullName().trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(registerRequestDto.getPassword()));
        user.setPhoneNumber(registerRequestDto.getPhoneNumber());
        user.setPhoneNumber(registerRequestDto.getPhoneNumber() != null ? registerRequestDto.getPhoneNumber().trim() : null);
        user.setProfilePictureUrl(AllowedAvatars.DEFAULT_AVATAR);
        user.setRole(userRole);
        user = userRepository.save(user);
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        return new AuthResponseDto(token, userMapper.toDto(user));
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponseDto login(LoginRequestDto loginRequestDto) {
        String normalizedEmail = loginRequestDto.getEmail().trim().toLowerCase(Locale.ROOT);

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, loginRequestDto.getPassword())
        );

        UserEntity user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException(USER_NOT_FOUND_MSG));

        UserDetails userDetails = userDetailsService.loadUserByUsername(normalizedEmail);
        String token = jwtService.generateToken(userDetails);

        return new AuthResponseDto(token, userMapper.toDto(user));
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getAccountDetails(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(USER_NOT_FOUND_MSG));
        return userMapper.toDto(user);
    }

    @Override
    @Transactional
    public UserDto updateAccountDetails(String email, UserUpdateDto userUpdateDto) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(USER_NOT_FOUND_MSG));

        String requestedAvatar = userUpdateDto.getProfilePictureUrl();
        if (requestedAvatar == null || requestedAvatar.isBlank()) {
            user.setProfilePictureUrl(AllowedAvatars.DEFAULT_AVATAR);
        } else if (AllowedAvatars.isAllowed(requestedAvatar)) {
            user.setProfilePictureUrl(requestedAvatar.trim());
        } else {
            throw new InvalidInputException("Please select a valid profile picture from the preset list.");
        }

        user.setFullName(userUpdateDto.getFullName().trim());
        user.setPhoneNumber(userUpdateDto.getPhoneNumber() != null ? userUpdateDto.getPhoneNumber().trim() : null);
        UserEntity saved = userRepository.save(user);
        return userMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationDto> getUserReservations(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(USER_NOT_FOUND_MSG));
        return reservationMapper.toDto(reservationRepository.findAllByUser_id(user.getId()));
    }
}
