package com.example.demo.controller;

import com.example.demo.dto.auth.AuthRequest;
import com.example.demo.entity.RefreshToken;
import com.example.demo.entity.User;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.PasswordResetService;
import com.example.demo.service.RefreshTokenService;
import com.example.demo.service.UserService;
import com.example.demo.service.mail.MailService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final PasswordResetService passwordResetService;
    private final MailService mailService;

    public AuthController(UserService userService, JwtUtil jwtUtil,
                          RefreshTokenService refreshTokenService,
                          PasswordResetService passwordResetService,
                          MailService mailService) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.refreshTokenService = refreshTokenService;
        this.passwordResetService = passwordResetService;
        this.mailService = mailService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userService.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User created = userService.create(user);
        // Send welcome email async (won't crash if mail not configured)
        try { mailService.sendWelcome(created.getEmail(),
            created.getFullName() != null ? created.getFullName() : "there"); } catch (Exception ignored) {}
        // Return safe DTO — never expose password hash
        return ResponseEntity.ok(Map.of(
            "id", created.getId(),
            "email", created.getEmail(),
            "fullName", created.getFullName() != null ? created.getFullName() : ""
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req) {
        return userService.findByEmail(req.getEmail())
            .filter(u -> u.isEnabled() && passwordEncoder.matches(req.getPassword(), u.getPassword()))
            .map(u -> {
                String access = jwtUtil.generateAccessToken(u.getEmail());
                RefreshToken rt = refreshTokenService.createForUser(u);
                ResponseCookie cookie = ResponseCookie.from("karyarthi-refresh", rt.getToken())
                    .httpOnly(true).path("/").maxAge(60 * 60 * 24 * 7).sameSite("Lax").build();
                return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body((Object) Map.of(
                        "token", access,
                        "user", Map.of(
                            "id", u.getId(),
                            "email", u.getEmail(),
                            "fullName", u.getFullName() != null ? u.getFullName() : "",
                            "role", u.getRole() != null ? u.getRole() : "USER"
                        )
                    ));
            }).orElseGet(() ->
                ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"))
            );
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(
            @CookieValue(value = "karyarthi-refresh", required = false) String refreshCookie) {
        if (refreshCookie == null) return ResponseEntity.status(401).build();
        return refreshTokenService.findByToken(refreshCookie)
            .map(rt -> {
                String access = jwtUtil.generateAccessToken(rt.getUser().getEmail());
                return ResponseEntity.ok((Object) Map.of("token", access));
            }).orElseGet(() -> ResponseEntity.status(401).build());
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @CookieValue(value = "karyarthi-refresh", required = false) String refreshCookie) {
        if (refreshCookie != null) {
            refreshTokenService.findByToken(refreshCookie).ifPresent(refreshTokenService::revoke);
        }
        ResponseCookie cookie = ResponseCookie.from("karyarthi-refresh", "")
            .httpOnly(true).path("/").maxAge(0).build();
        return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE, cookie.toString()).build();
    }

    @PostMapping("/request-password-reset")
    public ResponseEntity<?> requestPasswordReset(@RequestParam String email) {
        userService.findByEmail(email).ifPresent(user -> {
            var prt = passwordResetService.createForUser(user);
            try { mailService.sendPasswordReset(email, prt.getToken()); } catch (Exception ignored) {}
        });
        return ResponseEntity.ok(Map.of("message", "If that email is registered, a reset link has been sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String token, @RequestParam String newPassword) {
        if (newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 8 characters"));
        }
        return passwordResetService.findByToken(token).map(prt -> {
            User u = prt.getUser();
            u.setPassword(passwordEncoder.encode(newPassword));
            userService.create(u);
            passwordResetService.markUsed(prt);
            return ResponseEntity.ok((Object) Map.of("message", "Password reset successfully"));
        }).orElseGet(() ->
            ResponseEntity.status(400).body(Map.of("error", "Invalid or expired token"))
        );
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        try {
            String email = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
            return userService.findByEmail(email)
                .map(u -> ResponseEntity.ok((Object) Map.of(
                    "id", u.getId(),
                    "email", u.getEmail(),
                    "fullName", u.getFullName() != null ? u.getFullName() : "",
                    "role", u.getRole() != null ? u.getRole() : "USER"
                )))
                .orElse(ResponseEntity.status(401).build());
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }
}
