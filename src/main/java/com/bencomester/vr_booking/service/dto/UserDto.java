package com.bencomester.vr_booking.service.dto;

import com.bencomester.vr_booking.data.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String profilePictureUrl;
    private LocalDateTime createdAt;
    private UserRole role;
}
