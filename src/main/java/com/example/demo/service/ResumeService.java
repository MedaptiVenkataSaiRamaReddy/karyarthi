package com.example.demo.service;
import com.example.demo.entity.Resume;
import java.util.List;
import java.util.Optional;
public interface ResumeService {
    Resume save(Resume r);
    Optional<Resume> findById(String id);
    List<Resume> findByOwner(String userId);
    void updateStatus(String id, String status);
    void updateOptimizedContent(String id, String json, int score, String path);
}