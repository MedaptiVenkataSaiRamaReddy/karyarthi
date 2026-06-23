package com.example.demo.service.razorpay;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

/**
 * Minimal Razorpay integration using REST API calls (no external SDK required).
 *
 * This class will call the Razorpay REST API to create orders and verify webhook
 * signatures using the configured key-id/key-secret in `application.yml`.
 */
@Service
public class RazorpayService {

    @Value("${app.Razorpay.key-id:}")
    private String keyId;

    @Value("${app.Razorpay.key-secret:}")
    private String keySecret;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    /**
     * Create a provider order on Razorpay and return provider details.
     * If keys are not configured this falls back to a deterministic stub for local development.
     */
    public Map<String, String> createProviderOrder(long amountInPaise, String currency) {
        if (keyId == null || keyId.isBlank() || keySecret == null || keySecret.isBlank()) {
            String providerOrderId = "rp_order_" + UUID.randomUUID();
            return Map.of(
                    "providerOrderId", providerOrderId,
                    "amount", String.valueOf(amountInPaise),
                    "currency", currency
            );
        }

        try {
            String url = "https://api.razorpay.com/v1/orders";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            String auth = Base64.getEncoder().encodeToString((keyId + ":" + keySecret).getBytes(StandardCharsets.UTF_8));
            headers.set("Authorization", "Basic " + auth);

            Map<String, Object> req = Map.of(
                    "amount", amountInPaise,
                    "currency", currency,
                    "receipt", "rcpt_" + UUID.randomUUID(),
                    "payment_capture", 1
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(req, headers);
            ResponseEntity<Map> resp = restTemplate.postForEntity(url, entity, Map.class);
            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                Object id = resp.getBody().get("id");
                String providerOrderId = id != null ? id.toString() : "rp_order_" + UUID.randomUUID();
                return Map.of(
                        "providerOrderId", providerOrderId,
                        "amount", String.valueOf(amountInPaise),
                        "currency", currency
                );
            }
            throw new RuntimeException("Failed to create provider order: " + resp.getStatusCode());
        } catch (Exception ex) {
            System.out.println("RAZORPAY ERROR:");
            System.out.println(ex.getMessage());
            ex.printStackTrace();
            throw ex;
        }
    }

    /**
     * Verify Razorpay webhook signature. Razorpay sends HMAC SHA256 of the request body
     * as the signature (header X-Razorpay-Signature). We compute HMAC with the configured secret
     * and compare.
     */
    public boolean verifyWebhookSignature(String payload, String signature) {
        if (keySecret == null || keySecret.isBlank()) return true; // allow in local dev
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] raw = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String expected = HexFormat.of().formatHex(raw);
            // Signature can be provided in hex or base64 depending on provider; compare lowercase hex
            return expected.equalsIgnoreCase(signature) || Base64.getEncoder().encodeToString(raw).equals(signature);
        } catch (Exception e) {
            return false;
        }
    }

     /**
     * Verifies the Razorpay payment signature (client-side verification).
     * Signature = HMAC-SHA256(orderId + "|" + paymentId, keySecret)
     */
    public boolean verifyPaymentSignature(String orderId, String paymentId, String signature) {
        if (keySecret == null || keySecret.isBlank()) return true; // stub mode
        try {
            String data = orderId + "|" + paymentId;
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            mac.init(new javax.crypto.spec.SecretKeySpec(keySecret.getBytes(), "HmacSHA256"));
            byte[] raw = mac.doFinal(data.getBytes());
            String expected = HexFormat.of().formatHex(raw);
            return expected.equalsIgnoreCase(signature);
        } catch (Exception e) {
            return false;
        }
    }

}