package com.example.demo.service.impl;
import com.example.demo.entity.Resume;
import com.example.demo.repository.ResumeRepository;
import com.example.demo.service.ResumeService;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
@Service
public class ResumeServiceImpl implements ResumeService {
    private final ResumeRepository repo;
    public ResumeServiceImpl(ResumeRepository repo) { this.repo = repo; }
    @Override public Resume save(Resume r) { return repo.save(r); }
    @Override public Optional<Resume> findById(String id) { return repo.findById(id); }
    @Override public List<Resume> findByOwner(String uid) { return repo.findByOwnerIdOrderByCreatedAtDesc(uid); }
    @Override public void updateStatus(String id, String status) {
        repo.findById(id).ifPresent(r -> { r.setStatus(status); repo.save(r); }); }
    @Override public void updateOptimizedContent(String id, String json, int score, String path) {
        repo.findById(id).ifPresent(r -> {
            r.setOptimizedJson(json); r.setAtsScore(score);
            r.setGeneratedFilePath(path); r.setStatus("READY"); repo.save(r); }); }
}