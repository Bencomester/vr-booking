package com.bencomester.vr_booking.data.enums;

import com.bencomester.vr_booking.exception.InvalidInputException;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum HeadsetStatus {
    AVAILABLE("Available"),
    MAINTENANCE("Maintenance"),
    COMING_SOON("Coming Soon..."),;

    private final String name;

    HeadsetStatus(String name) {
        this.name = name;
    }

    @JsonValue
    @Override
    public String toString() {
        return name;
    }

    @JsonCreator
    public static HeadsetStatus fromValue(String value) {
        for (HeadsetStatus status : values()) {
            if (status.name.equalsIgnoreCase(value) || status.name().equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new InvalidInputException("Unknown HeadsetStatus: " + value);
    }
}
