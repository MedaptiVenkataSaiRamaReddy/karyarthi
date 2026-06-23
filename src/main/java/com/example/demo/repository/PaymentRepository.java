package com.example.demo.repository;
import com.example.demo.entity.Payment;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
public interface PaymentRepository extends MongoRepository<Payment, String> {
    Optional<Payment> findByOrderId(String orderId);
    Optional<Payment> findByProviderOrderId(String providerOrderId);
    List<Payment> findByResumeIdAndFormatAndStatus(String resumeId, String format, String status);
    List<Payment> findAllByOrderByCreatedAtDesc();
    List<Payment> findByUserId(String userId);
    List<Payment> findByResumeId(String resumeId);
    @Aggregation(pipeline = {
        "{ $match: { status: 'COMPLETED' } }",
        "{ $group: { _id: null, total: { $sum: '$amountInPaise' } } }",
        "{ $project: { _id: 0, total: 1 } }"
    })
    Long totalRevenuePaise();
    long countByStatus(String status);




}