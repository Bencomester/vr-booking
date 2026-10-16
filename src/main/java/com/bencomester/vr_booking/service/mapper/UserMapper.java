package com.bencomester.vr_booking.service.mapper;

import com.bencomester.vr_booking.data.entity.UserEntity;
import com.bencomester.vr_booking.service.dto.UserDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "role", expression = "java(userEntity.getRole().getName())")
    UserDto toDto(UserEntity userEntity);
}
