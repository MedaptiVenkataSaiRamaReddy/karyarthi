package com.example.demo.dto;
import java.time.LocalDateTime;
import java.util.Map;
public class ErrorDTO {
    private int status;
    private String message;
    private LocalDateTime timestamp;
    private Map<String, String> details;
    public int getStatus() { return status; }
    public void setStatus(int v) { this.status = v; }
    public String getMessage() { return message; }
    public void setMessage(String v) { this.message = v; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime v) { this.timestamp = v; }
    public Map<String, String> getDetails() { return details; }
    public void setDetails(Map<String, String> v) { this.details = v; }
}