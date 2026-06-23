package com.example.demo.service.mail;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Email service - gracefully degrades to console logging if SMTP not configured.
 * Uses reflection to avoid hard compile dependency on spring-boot-starter-mail.
 */
@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${spring.mail.username:noreply@karyarthi.in}")
    private String fromAddress;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    private boolean isConfigured() {
        return mailPassword != null && !mailPassword.isBlank();
    }

    @Async
    public void sendPasswordReset(String toEmail, String token) {
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        if (!isConfigured()) {
            log.warn("RESET LINK (configure SMTP_PASSWORD to send real emails): {} → {}", toEmail, resetUrl);
            return;
        }
        sendMail(toEmail, "Reset your Karyarthi password",
            "<h2>Reset your password</h2><p><a href='" + resetUrl + "'>Click to reset</a></p><p>Expires in 1 hour.</p>");
    }

    @Async
    public void sendWelcome(String toEmail, String name) {
        if (!isConfigured()) {
            log.info("WELCOME (no SMTP): {} <{}>", name, toEmail);
            return;
        }
        sendMail(toEmail, "Welcome to Karyarthi!",
            "<h2>Welcome, " + name + "! 🎉</h2><p>Your account is ready. <a href='" + frontendUrl + "/dashboard'>Start optimizing resumes</a></p>");
    }

    @Async
    public void sendPaymentConfirmation(String toEmail, String name, String resumeTitle) {
        if (!isConfigured()) {
            log.info("PAYMENT CONFIRMED (no SMTP): {} <{}>", name, toEmail);
            return;
        }
        sendMail(toEmail, "Payment confirmed — Download ready",
            "<h2>Payment confirmed ✓</h2><p>Hi " + name + ", your ₹9 payment was received. <a href='" + frontendUrl + "/dashboard'>Download your resume</a></p>");
    }

    private void sendMail(String to, String subject, String htmlBody) {
        try {
            // Use reflection to avoid hard dependency on JavaMailSender at compile time
            Class<?> senderClass = Class.forName("org.springframework.mail.javamail.JavaMailSenderImpl");
            Object sender = senderClass.getDeclaredConstructor().newInstance();
            senderClass.getMethod("setHost", String.class).invoke(sender,
                System.getProperty("spring.mail.host", "smtp.gmail.com"));
            senderClass.getMethod("setPort", int.class).invoke(sender,
                Integer.parseInt(System.getProperty("spring.mail.port", "587")));
            senderClass.getMethod("setUsername", String.class).invoke(sender, fromAddress);
            senderClass.getMethod("setPassword", String.class).invoke(sender, mailPassword);

            Object mimeMsg = senderClass.getMethod("createMimeMessage").invoke(sender);
            Class<?> helperClass = Class.forName("org.springframework.mail.javamail.MimeMessageHelper");
            Object helper = helperClass.getDeclaredConstructor(
                Class.forName("jakarta.mail.internet.MimeMessage"), boolean.class, String.class)
                .newInstance(mimeMsg, true, "UTF-8");
            helperClass.getMethod("setFrom", String.class, String.class).invoke(helper, fromAddress, "Karyarthi");
            helperClass.getMethod("setTo", String.class).invoke(helper, to);
            helperClass.getMethod("setSubject", String.class).invoke(helper, subject);
            helperClass.getMethod("setText", String.class, boolean.class).invoke(helper, htmlBody, true);
            senderClass.getMethod("send", Class.forName("jakarta.mail.internet.MimeMessage")).invoke(sender, mimeMsg);
            log.info("Email sent to {}: {}", to, subject);
        } catch (Exception e) {
            log.error("Email send failed to {}: {}", to, e.getMessage());
        }
    }
}
