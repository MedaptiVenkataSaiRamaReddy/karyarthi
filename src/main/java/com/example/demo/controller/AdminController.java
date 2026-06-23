package com.example.demo.controller;

import com.example.demo.entity.Payment;
import com.example.demo.entity.User;
import com.example.demo.repository.*;
import com.example.demo.service.impl.UserServiceImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepo;
    private final ResumeRepository resumeRepo;
    private final PaymentRepository paymentRepo;
    private final RefreshTokenRepository refreshTokenRepo;
    private final PasswordResetTokenRepository passwordResetTokenRepo;
    private final DownloadHistoryRepository downloadHistoryRepo;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private final UserServiceImpl userServiceImpl;

    public AdminController(UserRepository userRepo, ResumeRepository resumeRepo,
                           PaymentRepository paymentRepo,
                           RefreshTokenRepository refreshTokenRepo,
                           PasswordResetTokenRepository passwordResetTokenRepo,
                           DownloadHistoryRepository downloadHistoryRepo, UserServiceImpl userServiceImpl) {
        this.userRepo = userRepo;
        this.resumeRepo = resumeRepo;
        this.paymentRepo = paymentRepo;
        this.refreshTokenRepo = refreshTokenRepo;
        this.passwordResetTokenRepo = passwordResetTokenRepo;
        this.downloadHistoryRepo = downloadHistoryRepo;
        this.userServiceImpl = userServiceImpl;
    }

    /* ── Dashboard stats ─────────────────────────────── */
    @GetMapping("/stats")
    public ResponseEntity<?> stats() {
        long totalRevPaise = Optional.ofNullable(paymentRepo.totalRevenuePaise()).orElse(0L);
        List<Payment> allPayments = paymentRepo.findAll();
        long recentRev = allPayments.stream()
            .filter(p -> "COMPLETED".equals(p.getStatus()))
            .filter(p -> p.getCreatedAt() != null &&
                p.getCreatedAt().isAfter(java.time.LocalDateTime.now().minusDays(7)))
            .mapToLong(Payment::getAmountInPaise).sum() / 100;

        return ResponseEntity.ok(Map.of(
            "totalUsers",          userRepo.count(),
            "totalResumes",        resumeRepo.count(),
            "readyResumes",        resumeRepo.countByStatus("READY"),
            "seniorResumes",       resumeRepo.countByType("SENIOR"),
            "fresherResumes",      resumeRepo.countByType("FRESHER"),
            "completedPayments",   Optional.ofNullable(paymentRepo.countByStatus("COMPLETED")).orElse(0L),
            "totalRevenueRupees",  totalRevPaise / 100.0,
            "last7DaysRevenueRupees", recentRev
        ));
    }

    /* ── Users ───────────────────────────────────────── */
    @GetMapping("/users")
    public ResponseEntity<?> listUsers() {
        return ResponseEntity.ok(userRepo.findAll().stream().map(u -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",          u.getId());
            m.put("email",       u.getEmail());
            m.put("fullName",    u.getFullName() != null ? u.getFullName() : "");
            m.put("role",        u.getRole());
            m.put("enabled",     u.isEnabled());
            m.put("resumeCount", resumeRepo.findByOwnerIdOrderByCreatedAtDesc(u.getId()).size());
            return m;
        }).collect(Collectors.toList()));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateRole(@PathVariable("id") String id,
                                        @RequestBody Map<String, String> body) {
        String role = body.get("role");
        if (!"ADMIN".equals(role) && !"USER".equals(role))
            return ResponseEntity.badRequest().body(Map.of("error", "Role must be ADMIN or USER"));
        return userRepo.findById(id).map(u -> {
            u.setRole(role); userRepo.save(u);
            return ResponseEntity.ok(Map.of("message", "Role updated to " + role));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/users/{id}/toggle")
    public ResponseEntity<?> toggleEnabled(@PathVariable("id") String id) {
        return userRepo.findById(id).map(u -> {
            u.setEnabled(!u.isEnabled()); userRepo.save(u);
            return ResponseEntity.ok(Map.of("enabled", u.isEnabled()));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/users/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable("id") String id,
                                           @RequestBody Map<String, String> body) {
        String pw = body.get("password");
        if (pw == null || pw.length() < 8)
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 8 chars"));
        return userRepo.findById(id).map(u -> {
            u.setPassword(encoder.encode(pw)); userRepo.save(u);
            return ResponseEntity.ok(Map.of("message", "Password reset"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable("id") String id) {
        if (!userRepo.existsById(id)) return ResponseEntity.notFound().build();
        // Clean up FK references in correct order
        downloadHistoryRepo.findAll().stream()
            .filter(dh -> dh.getUser() != null && id.equals(dh.getUser().getId()))
            .forEach(dh -> downloadHistoryRepo.delete(dh));
        paymentRepo.findByUserId(id).forEach(p -> paymentRepo.delete(p));
        refreshTokenRepo.findAll().stream()
            .filter(rt -> rt.getUser() != null && id.equals(rt.getUser().getId()))
            .forEach(rt -> refreshTokenRepo.delete(rt));
        passwordResetTokenRepo.findAll().stream()
            .filter(prt -> prt.getUser() != null && id.equals(prt.getUser().getId()))
            .forEach(prt -> passwordResetTokenRepo.delete(prt));
        resumeRepo.findByOwnerId(id).forEach(r -> resumeRepo.delete(r));
        userRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User and all associated data deleted"));
    }

    /* ── Resumes ─────────────────────────────────────── */
    @GetMapping("/resumes")
    public ResponseEntity<?> listResumes() {
        return ResponseEntity.ok(resumeRepo.findAllByOrderByCreatedAtDesc().stream().map(r -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",        r.getId());
            m.put("title",     r.getResumeTitle() != null ? r.getResumeTitle() : "Untitled");
            m.put("status",    r.getStatus());
            m.put("type",      r.getType());
            m.put("atsScore",  r.getAtsScore() != null ? r.getAtsScore() : 0);
            m.put("createdAt", r.getCreatedAt());
            if (r.getOwner() != null) {
                m.put("ownerEmail", r.getOwner().getEmail());
                m.put("ownerId",    r.getOwner().getId());
            }
            return m;
        }).collect(Collectors.toList()));
    }

    @DeleteMapping("/resumes/{id}")
    public ResponseEntity<?> deleteResume(@PathVariable("id") String id) {
        if (!resumeRepo.existsById(id)) return ResponseEntity.notFound().build();
        // Clean FK references first
        downloadHistoryRepo.findAll().stream()
            .filter(dh -> dh.getResume() != null && id.equals(dh.getResume().getId()))
            .forEach(dh -> downloadHistoryRepo.delete(dh));
        paymentRepo.findByResumeId(id).forEach(p -> paymentRepo.delete(p));
        resumeRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Resume deleted"));
    }

    /* ── Payments ────────────────────────────────────── */
    @GetMapping("/payments")
    public ResponseEntity<?> listPayments() {
        return ResponseEntity.ok(paymentRepo.findAll().stream().map(p -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",               p.getId());
            m.put("orderId",          p.getOrderId());
            m.put("providerPaymentId", p.getProviderPaymentId());
            m.put("amountRupees",     p.getAmountInPaise() / 100.0);
            m.put("status",           p.getStatus());
            m.put("format",           p.getFormat());
            m.put("createdAt",        p.getCreatedAt());
            if (p.getUser() != null) {
                m.put("userEmail", p.getUser().getEmail());
                m.put("userId",    p.getUser().getId());
            }
            if (p.getResume() != null) {
                m.put("resumeTitle", p.getResume().getResumeTitle());
                m.put("resumeId",    p.getResume().getId());
            }
            return m;
        }).collect(Collectors.toList()));
    }

    /* ── Bootstrap (public — creates first admin only) ─ */
    @PostMapping("/bootstrap")
    @PreAuthorize("permitAll()")
    public ResponseEntity<?> bootstrap(@RequestBody Map<String, String> body) {
        boolean adminExists = userRepo.findAll().stream()
            .anyMatch(u -> "ADMIN".equals(u.getRole()));
        if (adminExists)
            return ResponseEntity.status(403).body(Map.of("error", "Admin already exists"));

        String email    = body.get("email");
        String password = body.get("password");
        String name     = body.getOrDefault("fullName", "Admin");
        if (email == null || password == null || password.length() < 8)
            return ResponseEntity.badRequest().body(Map.of("error", "email and password (min 8) required"));

        User admin = userRepo.findByEmail(email).orElse(new User());
        admin.setEmail(email);
        admin.setFullName(name);
        admin.setPassword(encoder.encode(password));
        admin.setRole("ADMIN");
        admin.setEnabled(true);
        userRepo.save(admin);
        return ResponseEntity.ok(Map.of("message", "Admin account created. Login at /admin"));
    }
}
