package com.example.demo.service.impl;
import com.example.demo.entity.Payment;
import com.example.demo.entity.Resume;
import com.example.demo.entity.User;
import com.example.demo.repository.PaymentRepository;
import com.example.demo.service.PaymentService;
import com.example.demo.service.razorpay.RazorpayService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.UUID;
@Service
public class PaymentServiceImpl implements PaymentService {
    private static final Logger log = LoggerFactory.getLogger(PaymentServiceImpl.class);
    private final PaymentRepository repo;
    private final RazorpayService razorpay;
    @Value("${payments.amount-paise:900}") private long amountInPaise;
    @Value("${payments.currency:INR}") private String currency;
    public PaymentServiceImpl(PaymentRepository repo, RazorpayService razorpay) {
        this.repo = repo; this.razorpay = razorpay; }
    @Override public Payment createOrder(Resume resume, User user, String format) {
        Payment p = new Payment();
        p.setOrderId(UUID.randomUUID().toString());
        p.setResume(resume); p.setUser(user); p.setFormat(format);
        p.setAmountInPaise(amountInPaise); p.setCurrency(currency); p.setStatus("CREATED");
        try { Map<String,String> o = razorpay.createProviderOrder(amountInPaise, currency);
              p.setProviderOrderId(o.getOrDefault("id","")); }
        catch(Exception e) { log.warn("Razorpay stub: {}", e.getMessage()); }
        return repo.save(p); }
    @Override public void markCompleted(String orderId, String pid) {
        repo.findByOrderId(orderId).ifPresent(p -> {
            if (!"COMPLETED".equals(p.getStatus())) { p.setStatus("COMPLETED"); p.setProviderPaymentId(pid); repo.save(p); } }); }
    @Override public void markCompletedByProviderOrderId(String provId, String pid) {
        repo.findByProviderOrderId(provId).ifPresent(p -> {
            if (!"COMPLETED".equals(p.getStatus())) { p.setStatus("COMPLETED"); p.setProviderPaymentId(pid); repo.save(p); } }); }
    @Override public boolean hasCompletedPayment(String resumeId, String format) {
        return !repo.findByResumeIdAndFormatAndStatus(resumeId, format, "COMPLETED").isEmpty(); }
}