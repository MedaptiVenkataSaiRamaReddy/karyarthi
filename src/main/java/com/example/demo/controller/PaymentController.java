package com.example.demo.controller;

import com.example.demo.entity.Payment;
import com.example.demo.entity.Resume;
import com.example.demo.entity.User;
import com.example.demo.service.PaymentService;
import com.example.demo.service.ResumeService;
import com.example.demo.service.UserService;
import com.example.demo.service.razorpay.RazorpayService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final ResumeService resumeService;
    private final UserService userService;
    private final RazorpayService razorpayService;

    @Value("${app.Razorpay.key-id:}")
    private String razorpayKeyId;

    public PaymentController(PaymentService paymentService, ResumeService resumeService,
                              UserService userService, RazorpayService razorpayService) {
        this.paymentService = paymentService;
        this.resumeService = resumeService;
        this.userService = userService;
        this.razorpayService = razorpayService;
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, String> body) {
        String resumeId = body.get("resumeId");
        String format = body.getOrDefault("format", "pdf");

        Resume resume = resumeService.findById(resumeId).orElse(null);
        if (resume == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Resume not found"));

        if (!"READY".equals(resume.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Resume is not ready yet"));
        }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.findByEmail(username).orElse(null);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        // Check if already paid (idempotency)
        if (paymentService.hasCompletedPayment(resumeId, format)) {
            return ResponseEntity.ok(Map.of(
                "alreadyPaid", true,
                "message", "Payment already completed — download is available"
            ));
        }

        Payment p = paymentService.createOrder(resume, user, format);
        return ResponseEntity.ok(Map.of(
            "orderId", p.getOrderId(),
            "providerOrderId", p.getProviderOrderId() != null ? p.getProviderOrderId() : "",
            "amount", p.getAmountInPaise(),
            "currency", "INR",
            "razorpayKeyId", razorpayKeyId != null ? razorpayKeyId : ""
        ));
    }

    /** Client-side payment verification (after Razorpay handler fires) */
    @PostMapping("/verify")
    public ResponseEntity<?> verify(@RequestBody Map<String, String> body) {
        String razorpayOrderId = body.get("razorpayOrderId");
        String razorpayPaymentId = body.get("razorpayPaymentId");
        String razorpaySignature = body.get("razorpaySignature");
        String resumeId = body.get("resumeId");
        String format = body.getOrDefault("format", "pdf");

        if (razorpayOrderId == null || razorpayPaymentId == null || razorpaySignature == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing payment details"));
        }

        boolean valid = razorpayService.verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
        if (!valid) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid payment signature"));

        paymentService.markCompletedByProviderOrderId(razorpayOrderId, razorpayPaymentId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Payment verified. Download is now available."));
    }

    @PostMapping("/webhook")
    public ResponseEntity<?> webhook(@RequestHeader Map<String, String> headers, @RequestBody String body) {
        try {
            String razorpaySig = headers.entrySet().stream()
                .filter(e -> e.getKey().equalsIgnoreCase("x-razorpay-signature"))
                .map(Map.Entry::getValue).findFirst().orElse(null);

            if (razorpaySig != null) {
                boolean ok = razorpayService.verifyWebhookSignature(body, razorpaySig);
                if (!ok) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

                var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                var node = mapper.readTree(body);
                String providerOrderId = node.path("payload").path("payment").path("entity").path("order_id").asText(null);
                String providerPaymentId = node.path("payload").path("payment").path("entity").path("id").asText(null);
                if (providerOrderId != null && providerPaymentId != null) {
                    paymentService.markCompletedByProviderOrderId(providerOrderId, providerPaymentId);
                }
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
