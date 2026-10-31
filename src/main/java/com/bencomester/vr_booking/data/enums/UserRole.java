package com.bencomester.vr_booking.data.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum UserRole {
    USER("User"),
    ADMIN("Admin");

    private final String name;

    UserRole(String name) {
        this.name = name;
    }

    @JsonValue
    @Override
    public String toString() {
        return name;
    }

    @JsonCreator
    public static UserRole fromValue(String value) {
        for (UserRole role : UserRole.values()) {
            if (role.name.equalsIgnoreCase(value) || role.name().equalsIgnoreCase(value)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Unknown UserRole: " + value);
    }
}
