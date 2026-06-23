package com.example.demo.service;
import com.example.demo.entity.RefreshToken;
import com.example.demo.entity.User;
import java.util.Optional;
public interface RefreshTokenService {
    RefreshToken createForUser(User user);
    Optional<RefreshToken> findByToken(String token);
    void revoke(RefreshToken token);
    void revokeAllForUser(User user);
}