package com.shoes.ecommerce.dto;

public class AuthResponse {
    private String username;
    private String message;
    private String role;

    public AuthResponse() {}
    public AuthResponse(String username, String message) {
        this.username = username;
        this.message = message;
    }

    public AuthResponse(String username, String message, String role) {
        this.username = username;
        this.message = message;
        this.role = role;
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
