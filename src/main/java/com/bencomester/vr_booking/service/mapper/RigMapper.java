package com.bencomester.vr_booking.service.mapper;

import com.bencomester.vr_booking.data.entity.RigEntity;
import com.bencomester.vr_booking.service.dto.RigDto;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RigMapper {
    RigDto toDto(RigEntity rigEntity);
    List<RigDto> toDto(List<RigEntity> rigEntities);
    RigEntity toEntity(RigDto rigDto);
}
