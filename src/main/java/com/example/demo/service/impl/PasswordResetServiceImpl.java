package com.example.demo.service.impl;
import com.example.demo.entity.PasswordResetToken;
import com.example.demo.entity.User;
import com.example.demo.repository.PasswordResetTokenRepository;
import com.example.demo.service.PasswordResetService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
@Service
public class PasswordResetServiceImpl implements PasswordResetService {
    private final PasswordResetTokenRepository repo;
    public PasswordResetServiceImpl(PasswordResetTokenRepository repo) { this.repo = repo; }
    @Override public PasswordResetToken createForUser(User user) {
        PasswordResetToken t = new PasswordResetToken();
        t.setToken(UUID.randomUUID().toString()); t.setUser(user);
        t.setExpiresAt(LocalDateTime.now().plusHours(1)); t.setUsed(false); return repo.save(t); }
    @Override public Optional<PasswordResetToken> findByToken(String token) {
        return repo.findByToken(token)
            .filter(t -> !t.isUsed())
            .filter(t -> t.getExpiresAt() == null || t.getExpiresAt().isAfter(LocalDateTime.now())); }
    @Override public void markUsed(PasswordResetToken t) { t.setUsed(true); repo.save(t); }
}