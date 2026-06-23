package com.example.demo.service;
import com.example.demo.entity.PasswordResetToken;
import com.example.demo.entity.User;
import java.util.Optional;
public interface PasswordResetService {
    PasswordResetToken createForUser(User user);
    Optional<PasswordResetToken> findByToken(String token);
    void markUsed(PasswordResetToken token);
}