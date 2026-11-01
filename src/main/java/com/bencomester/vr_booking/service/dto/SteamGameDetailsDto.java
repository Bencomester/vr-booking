package com.bencomester.vr_booking.service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SteamGameDetailsDto {
    private Integer appId;
    private String name;
    private String shortDescription;
    private String aboutTheGame;
    private String headerImage;
    private List<String> developers;
    private List<String> publishers;
    private String releaseDate;
    private List<String> genres;
    private Integer metacriticScore;
    private List<String> screenshots;
    private String website;
}
