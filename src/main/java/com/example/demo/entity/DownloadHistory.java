package com.example.demo.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "download_history")
@Data
public class DownloadHistory {
    @Id private String id;
    @DBRef(lazy = true) private Resume resume;
    @DBRef(lazy = true) private User   user;
    private String format;
    private LocalDateTime downloadedAt = LocalDateTime.now();


}