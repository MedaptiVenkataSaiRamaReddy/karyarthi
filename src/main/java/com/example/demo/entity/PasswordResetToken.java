package com.example.demo.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "password_reset_tokens")
public class PasswordResetToken {
    @Id private String id;
    private String token;
    private LocalDateTime expiresAt;
    private boolean used = false;
    @DBRef(lazy = true) private User user;

    public String getId()                        { return id; }
    public void   setId(String v)               { this.id = v; }
    public String getToken()                     { return token; }
    public void   setToken(String v)             { this.token = v; }
    public LocalDateTime getExpiresAt()         { return expiresAt; }
    public void   setExpiresAt(LocalDateTime v) { this.expiresAt = v; }
    public boolean isUsed()                      { return used; }
    public void    setUsed(boolean v)            { this.used = v; }
    public User   getUser()                      { return user; }
    public void   setUser(User v)                { this.user = v; }
}