package com.bencomester.vr_booking.service.mapper;

import com.bencomester.vr_booking.data.entity.ReservationEntity;
import com.bencomester.vr_booking.service.dto.ReservationDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ReservationMapper {
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userFullName", source = "user.fullName")
    @Mapping(target = "headsetId", source = "headset.id")
    @Mapping(target = "headsetName", source = "headset.name")
    ReservationDto toDto(ReservationEntity reservationEntity);

    List<ReservationDto> toDto(List<ReservationEntity> reservationEntities);
}
