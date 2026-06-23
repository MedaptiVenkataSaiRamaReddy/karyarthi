package com.example.demo.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "payments")
@Data
public class Payment {
    @Id private String id;
    private String orderId, providerOrderId, providerPaymentId;
    private long   amountInPaise;
    private String currency = "INR", status = "CREATED", format = "pdf";
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
    @DBRef(lazy = true) private Resume resume;
    @DBRef(lazy = true) private User   user;


}