package com.example.demo.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;


@Document(collection = "refresh_tokens")
@Data
public class RefreshToken {
    @Id private String id;
    private String token;
    private LocalDateTime expiresAt;
    private boolean revoked = false;
    @DBRef(lazy = true) private User user;


}