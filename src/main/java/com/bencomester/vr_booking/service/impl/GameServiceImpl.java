package com.bencomester.vr_booking.service.impl;

import com.bencomester.vr_booking.data.entity.GameEntity;
import com.bencomester.vr_booking.data.entity.HeadsetEntity;
import com.bencomester.vr_booking.data.repository.GameRepository;
import com.bencomester.vr_booking.data.repository.HeadsetRepository;
import com.bencomester.vr_booking.exception.ExternalServiceException;
import com.bencomester.vr_booking.exception.InvalidInputException;
import com.bencomester.vr_booking.exception.ResourceNotFoundException;
import com.bencomester.vr_booking.service.GameService;
import com.bencomester.vr_booking.service.dto.GameDto;
import com.bencomester.vr_booking.service.dto.SteamGameDetailsDto;
import com.bencomester.vr_booking.service.mapper.GameMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GameServiceImpl implements GameService {

    private final GameRepository gameRepository;
    private final HeadsetRepository headsetRepository;
    private final GameMapper gameMapper;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(8))
            .build();

    @Override
    @Transactional(readOnly = true)
    public List<GameDto> findAll() {
        return gameMapper.toDto(gameRepository.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public GameDto findById(Long id) {
        return gameRepository.findById(id)
                .map(gameMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("No Game found with id: " + id));
    }

    @Override
    @Transactional
    public GameDto save(GameDto gameDto) {
        applySteamDefaultImage(gameDto);
        GameEntity gameEntity = gameMapper.toEntity(gameDto);
        gameEntity.setId(null);
        return gameMapper.toDto(gameRepository.save(gameEntity));
    }

    @Override
    @Transactional
    public GameDto update(Long id, GameDto gameDto) {
        applySteamDefaultImage(gameDto);
        GameEntity existing = gameRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No Game found with id: " + id));
        existing.setTitle(gameDto.getTitle());
        existing.setDescription(gameDto.getDescription());
        existing.setSteamAppId(gameDto.getSteamAppId());
        existing.setImageUrl(gameDto.getImageUrl());
        return gameMapper.toDto(gameRepository.save(existing));
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        if (!gameRepository.existsById(id)) {
            throw new ResourceNotFoundException("No Game found with id: " + id);
        }
        List<HeadsetEntity> headsets = headsetRepository.findAll();
        for (HeadsetEntity headset : headsets) {
            if (headset.getInstalledGames().removeIf(g -> g.getId().equals(id))) {
                headsetRepository.save(headset);
            }
        }
        gameRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public SteamGameDetailsDto fetchSteamGameDetails(String appId) {
        String id = appId == null ? "" : appId.trim();
        if (id.isEmpty() || !id.matches("\\d+")) {
            throw new InvalidInputException("Invalid numeric Steam App ID: " + id);
        }
        try {
            String url = "https://store.steampowered.com/api/appdetails?appids=" + id + "&l=english";
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Accept", "application/json")
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode root = objectMapper.readTree(response.body());
            JsonNode appNode = root.path(id);
            if (!appNode.path("success").asBoolean(false)) {
                throw new ResourceNotFoundException("Steam App ID " + id + " was not found on the Steam Store.");
            }
            JsonNode data = appNode.path("data");
            List<String> developers = new ArrayList<>();
            data.path("developers").forEach(n -> developers.add(n.asText()));

            List<String> publishers = new ArrayList<>();
            data.path("publishers").forEach(n -> publishers.add(n.asText()));

            List<String> genres = new ArrayList<>();
            data.path("genres").forEach(n -> genres.add(n.path("description").asText()));

            List<String> screenshots = new ArrayList<>();
            data.path("screenshots").forEach(n -> {
                if (screenshots.size() < 4) {
                    screenshots.add(n.path("path_full").asText());
                }
            });

            Integer metacritic = data.has("metacritic")
                    ? data.path("metacritic").path("score").asInt()
                    : null;

            return new SteamGameDetailsDto(
                    id,
                    data.path("name").asText(""),
                    data.path("short_description").asText(""),
                    data.path("about_the_game").asText(""),
                    data.path("header_image").asText("https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/" + id + "/header.jpg"),
                    developers,
                    publishers,
                    data.path("release_date").path("date").asText(""),
                    genres,
                    metacritic,
                    screenshots,
                    data.path("website").asText("")
            );
        } catch (ResourceNotFoundException | InvalidInputException e) {
            throw e;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ExternalServiceException("Steam API request was interrupted", e);
        } catch (Exception e) {
            throw new ExternalServiceException("Failed to fetch Steam Store API details: " + e.getMessage(), e);
        }
    }

    private void applySteamDefaultImage(GameDto dto) {
        if ((dto.getImageUrl() == null || dto.getImageUrl().isBlank())
                && dto.getSteamAppId() != null) {
            dto.setImageUrl("https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/"
                    + dto.getSteamAppId() + "/header.jpg");
        }
    }
}
