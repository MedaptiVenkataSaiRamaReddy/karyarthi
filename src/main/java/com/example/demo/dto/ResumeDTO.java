package com.example.demo.dto;
import java.util.UUID;

public class ResumeDTO {
    private UUID id;
    private String originalFileName;
    private String parsedText;
    public UUID getId() { return id; }
    public void setId(UUID v) { this.id = v; }
    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String v) { this.originalFileName = v; }
    public String getParsedText() { return parsedText; }
    public void setParsedText(String v) { this.parsedText = v; }
}