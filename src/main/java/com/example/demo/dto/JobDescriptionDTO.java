package com.example.demo.dto;

import org.hibernate.validator.constraints.UUID;

public class JobDescriptionDTO {
    private String id;
    private String title;
    private String content;
    public String getId() { return id; }
    public void setId(UUID v) { this.id = v.toString(); }
    public String getTitle() { return title; }
    public void setTitle(String v) { this.title = v; }
    public String getContent() { return content; }
    public void setContent(String v) { this.content = v; }
}