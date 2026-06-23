package com.example.demo.dto;

import java.util.UUID;

public class UserDTO {
    private String id;
    private String email;
    private String fullName;
    public String getId() { return id; }
    public void setId(UUID v) { this.id = v.toString(); }
    public String getEmail() { return email; }
    public void setEmail(String v) { this.email = v; }
    public String getFullName() { return fullName; }
    public void setFullName(String v) { this.fullName = v; }
}