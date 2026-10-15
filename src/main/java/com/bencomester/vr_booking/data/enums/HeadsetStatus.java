package com.bencomester.vr_booking.data.enums;

public enum HeadsetStatus {
    AVAILABLE("Available"),
    MAINTENANCE("Maintenance"),
    COMING_SOON("Coming Soon..."),;

    private final String name;

    HeadsetStatus(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return name;
    }
}
