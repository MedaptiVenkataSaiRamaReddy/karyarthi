package com.example.demo.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;


@Document(collection = "resumes")
@Data
public class Resume {
    @Id private String id;
    private String originalFileName, resumeTitle;
    private String parsedText, optimizedJson, jobDescriptionText;
    private Integer atsScore;
    private String previousAtsScore;
    private String status = "UPLOADING";
    private String type   = "SENIOR";
    private String storagePath, generatedFilePath;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
    @DBRef(lazy = true) private User owner;


}