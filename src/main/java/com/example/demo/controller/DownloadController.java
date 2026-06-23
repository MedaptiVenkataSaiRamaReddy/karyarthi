package com.example.demo.controller;

import com.example.demo.entity.DownloadHistory;
import com.example.demo.entity.Resume;
import com.example.demo.entity.User;
import com.example.demo.repository.DownloadHistoryRepository;
import com.example.demo.service.PaymentService;
import com.example.demo.service.ResumeService;
import com.example.demo.service.UserService;
import com.example.demo.service.ai.OptimizedResume;
import com.example.demo.service.export.PdfResumeExporter;
import com.example.demo.service.mail.MailService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;

@RestController
public class DownloadController {

    private final PaymentService paymentService;
    private final ResumeService resumeService;
    private final UserService userService;
    private final DownloadHistoryRepository downloadHistoryRepository;
    private final PdfResumeExporter pdfExporter;
    private final MailService mailService;
    private final ObjectMapper mapper = new ObjectMapper();

    public DownloadController(PaymentService paymentService, ResumeService resumeService,
                              UserService userService, DownloadHistoryRepository downloadHistoryRepository,
                              PdfResumeExporter pdfExporter, MailService mailService) {
        this.paymentService = paymentService;
        this.resumeService = resumeService;
        this.userService = userService;
        this.downloadHistoryRepository = downloadHistoryRepository;
        this.pdfExporter = pdfExporter;
        this.mailService = mailService;
    }

    @GetMapping("/api/downloads/{resumeId}")
    public ResponseEntity<?> download(@PathVariable("resumeId") String resumeId,
                                       @RequestParam(defaultValue = "pdf") String format) throws Exception {
        var resumeOpt = resumeService.findById(resumeId);
        if (resumeOpt.isEmpty()) return ResponseEntity.notFound().build();
        Resume resume = resumeOpt.get();

        if (!"READY".equals(resume.getStatus())) {
            return ResponseEntity.status(425).body("Resume not ready yet");
        }

        boolean paid = paymentService.hasCompletedPayment(resumeId, format);
        if (!paid) return ResponseEntity.status(402).body("Payment required");

        User user = currentUser();

        // Get optimized resume data
        byte[] fileBytes;
        String fileName;
        String contentType;

        String title = resume.getResumeTitle() != null ? resume.getResumeTitle() : "resume";
        String safeName = title.replaceAll("[^a-zA-Z0-9_\\-]", "_");

        if (resume.getGeneratedFilePath() != null) {
            Path p = Path.of(resume.getGeneratedFilePath());
            if (Files.exists(p)) {
                fileBytes = Files.readAllBytes(p);
            } else {
                fileBytes = generateFromJson(resume, user);
            }
        } else {
            fileBytes = generateFromJson(resume, user);
        }

        if ("docx".equalsIgnoreCase(format)) {
            fileName = safeName + ".pdf"; // serve PDF as fallback for docx for now
            contentType = "application/pdf";
        } else {
            fileName = safeName + ".pdf";
            contentType = "application/pdf";
        }

        // Record download
        DownloadHistory dh = new DownloadHistory();
        dh.setResume(resume);
        dh.setUser(user);
        dh.setFormat(format);
        downloadHistoryRepository.save(dh);

        // Send payment confirmation email
        if (user != null) {
            mailService.sendPaymentConfirmation(user.getEmail(),
                user.getFullName() != null ? user.getFullName() : "there",
                title);
        }

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
            .contentLength(fileBytes.length)
            .contentType(MediaType.parseMediaType(contentType))
            .body(new ByteArrayResource(fileBytes));
    }

    private byte[] generateFromJson(Resume resume, User user) {
        try {
            if (resume.getOptimizedJson() != null) {
                OptimizedResume opt = mapper.readValue(resume.getOptimizedJson(), OptimizedResume.class);
                String name = user != null && user.getFullName() != null ? user.getFullName() : "Candidate";
                String email = user != null ? user.getEmail() : "";
                return pdfExporter.export(opt, name, email, null);
            }
        } catch (Exception e) {
            // fallback
        }
        return "Resume content unavailable".getBytes();
    }

    private User currentUser() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            return userService.findByEmail(email).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }
}
