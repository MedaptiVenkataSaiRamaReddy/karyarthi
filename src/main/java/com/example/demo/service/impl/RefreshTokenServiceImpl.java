package com.example.demo.service.impl;
import com.example.demo.entity.RefreshToken;
import com.example.demo.entity.User;
import com.example.demo.repository.RefreshTokenRepository;
import com.example.demo.service.RefreshTokenService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
@Service
public class RefreshTokenServiceImpl implements RefreshTokenService {
    private final RefreshTokenRepository repo;
    @Value("${app.jwt.refresh-expiration-in-ms:604800000}") private long expMs;
    public RefreshTokenServiceImpl(RefreshTokenRepository repo) { this.repo = repo; }
    @Override public RefreshToken createForUser(User user) {
        RefreshToken rt = new RefreshToken();
        rt.setToken(UUID.randomUUID().toString()); rt.setUser(user);
        rt.setExpiresAt(LocalDateTime.now().plusSeconds(expMs / 1000)); rt.setRevoked(false);
        return repo.save(rt); }
    @Override public Optional<RefreshToken> findByToken(String token) {
        return repo.findByToken(token)
            .filter(rt -> !rt.isRevoked())
            .filter(rt -> rt.getExpiresAt() == null || rt.getExpiresAt().isAfter(LocalDateTime.now())); }
    @Override public void revoke(RefreshToken rt) { rt.setRevoked(true); repo.save(rt); }
    @Override public void revokeAllForUser(User user) {
        repo.findByUserId(user.getId()).forEach(rt -> { rt.setRevoked(true); repo.save(rt); }); }
}