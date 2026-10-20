package com.bencomester.vr_booking.config;

import java.time.LocalDateTime;

public record Response<T>(
        boolean success,
        T data,
        Error error,
        LocalDateTime timestamp)
{
    public static <T> Response<T> success(T data) {
        return new Response<>(true, data, null, LocalDateTime.now());
    }

    public static Response<Void> failure(String code, String message) {
        return new Response<>(false, null, new Error(code, message), LocalDateTime.now());
    }

    public record Error(String code, String message) {}
}
