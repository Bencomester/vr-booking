package com.bencomester.vr_booking.service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateDto {
    @NotBlank
    private String fullName;
    private String phoneNumber;
    private String profilePictureUrl;
}
