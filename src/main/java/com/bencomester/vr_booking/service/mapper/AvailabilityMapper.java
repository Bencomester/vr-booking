package com.bencomester.vr_booking.service.mapper;

import com.bencomester.vr_booking.data.entity.AvailabilityEntity;
import com.bencomester.vr_booking.service.dto.AvailabilityDto;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AvailabilityMapper {
    AvailabilityDto toDto(AvailabilityEntity availabilityEntity);
    List<AvailabilityDto> toDto(List<AvailabilityEntity> availabilityEntities);
    AvailabilityEntity toEntity(AvailabilityDto availabilityDto);
}
