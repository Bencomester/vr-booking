package com.bencomester.vr_booking.config;

import com.bencomester.vr_booking.exception.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

@RestControllerAdvice
public class ExceptionHandlerConfig implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        Class<?> type = returnType.getParameterType();
        return !Response.class.isAssignableFrom(type)
                && !ResponseEntity.class.isAssignableFrom(type)
                && !StringHttpMessageConverter.class.isAssignableFrom(converterType);
    }

    @Override
    public Object beforeBodyWrite(
            Object body,
            MethodParameter returnType,
            MediaType selectedContentType,
            Class<? extends HttpMessageConverter<?>> selectedConverterType,
            ServerHttpRequest request,
            ServerHttpResponse response) {

        if (body instanceof Response) return body;

        return Response.success(body);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Response<Void>> handleBadRequest(IllegalArgumentException exception) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, HttpStatus.BAD_REQUEST.toString(), exception.getMessage());
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Response<Void>> handleNotFound(ResourceNotFoundException ex, HttpServletRequest req) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", ex.getMessage());
    }

    @ExceptionHandler(ResourceConflictException.class)
    public ResponseEntity<Response<Void>> handleConflict(ResourceConflictException ex, HttpServletRequest req) {
        return buildErrorResponse(HttpStatus.CONFLICT, "RESOURCE_CONFLICT", ex.getMessage());
    }

    @ExceptionHandler({InvalidInputException.class, IllegalArgumentException.class})
    public ResponseEntity<Response<Void>> handleBadRequest(RuntimeException ex, HttpServletRequest req) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "INVALID_INPUT", ex.getMessage());
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Response<Void>> handleBadCredentials(BadCredentialsException exception) {
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, HttpStatus.UNAUTHORIZED.toString(), exception.getMessage());
    public ResponseEntity<Response<Void>> handleBadCredentials(BadCredentialsException ex, HttpServletRequest req) {
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, "BAD_CREDENTIALS", "Invalid email or password.");
    }

    @ExceptionHandler({ForbiddenOperationException.class, AccessDeniedException.class})
    public ResponseEntity<Response<Void>> handleAccessDenied(RuntimeException ex, HttpServletRequest req) {
        return buildErrorResponse(HttpStatus.FORBIDDEN, "FORBIDDEN_OPERATION", ex.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Response<Void>> handleAccessDenied(AccessDeniedException exception) {
        return buildErrorResponse(HttpStatus.FORBIDDEN, HttpStatus.FORBIDDEN.toString(), exception.getMessage());
    @ExceptionHandler(ExternalServiceException.class)
    public ResponseEntity<Response<Void>> handleExternalService(ExternalServiceException ex, HttpServletRequest req) {
        return buildErrorResponse(HttpStatus.BAD_GATEWAY, "EXTERNAL_SERVICE_ERROR", ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Response<Void>> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpServletRequest req) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .findFirst()
                .orElse("Validation error");
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", message);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Response<Void>> handleGenericException(Exception ex) {
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", ex.getMessage());
    public ResponseEntity<Response<Void>> handleGenericException(Exception ex, HttpServletRequest req) {
        return buildErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "INTERNAL_SERVER_ERROR",
                "An unexpected internal server error occurred."
        );
    }

    private ResponseEntity<Response<Void>> buildErrorResponse(HttpStatus status, String code, String message) {
        return new ResponseEntity<>(Response.failure(code, message), status);
    }
}
