package com.bencomester.vr_booking.service.mapper;

import com.bencomester.vr_booking.data.entity.GameEntity;
import com.bencomester.vr_booking.service.dto.GameDto;
import org.mapstruct.Mapper;

import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring")
public interface GameMapper {
    GameDto toDto(GameEntity gameEntity);
    List<GameDto> toDto(List<GameEntity> gameEntities);
    GameEntity toEntity(GameDto gameDto);
    Set<GameEntity> toEntity(Set<GameDto> gameDtos);
}
