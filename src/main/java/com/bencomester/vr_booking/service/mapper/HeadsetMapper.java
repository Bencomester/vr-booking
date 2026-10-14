package com.bencomester.vr_booking.service.mapper;

import com.bencomester.vr_booking.data.entity.HeadsetEntity;
import com.bencomester.vr_booking.service.dto.HeadsetDto;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {GameMapper.class})
public interface HeadsetMapper {
    HeadsetDto toDto(HeadsetEntity entity);
    List<HeadsetDto> toDto(List<HeadsetEntity> entities);
    HeadsetEntity toEntity(HeadsetDto headsetDto);
}
