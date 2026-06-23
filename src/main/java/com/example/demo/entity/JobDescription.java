package com.example.demo.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;


@Document(collection = "job_descriptions")
@Data
public class JobDescription {
    @Id private String id;
    private String title, content;
    private LocalDateTime createdAt = LocalDateTime.now();
    @DBRef(lazy = true) private User owner;


}