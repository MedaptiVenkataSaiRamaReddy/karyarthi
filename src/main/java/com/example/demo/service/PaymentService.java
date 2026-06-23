package com.example.demo.service;
import com.example.demo.entity.Payment;
import com.example.demo.entity.Resume;
import com.example.demo.entity.User;
public interface PaymentService {
    Payment createOrder(Resume resume, User user, String format);
    void markCompleted(String orderId, String providerPaymentId);
    void markCompletedByProviderOrderId(String providerOrderId, String providerPaymentId);
    boolean hasCompletedPayment(String resumeId, String format);
}