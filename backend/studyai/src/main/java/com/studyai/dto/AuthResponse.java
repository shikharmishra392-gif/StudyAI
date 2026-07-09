package com.studyai.dto;


public class AuthResponse {

    private String message;
    private String name;
    private String email;

    public AuthResponse(String message, String name, String email) {
        this.message = message;
        this.name = name;
        this.email = email;
    }

    public String getMessage() {
        return message;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }
}