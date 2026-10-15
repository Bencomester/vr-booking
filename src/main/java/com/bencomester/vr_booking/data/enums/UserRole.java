package com.bencomester.vr_booking.data.enums;

public enum UserRole {
    USER("User"),
    ADMIN("Admin");

    private final String name;

    UserRole(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return name;
    }
}
