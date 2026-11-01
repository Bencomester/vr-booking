package com.bencomester.vr_booking.service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateDto {
    @NotBlank
    @Size(max = 120)
    private String fullName;

    @Size(max = 40)
    private String phoneNumber;

    @Size(max = 1000)
    private String profilePictureUrl;
}
