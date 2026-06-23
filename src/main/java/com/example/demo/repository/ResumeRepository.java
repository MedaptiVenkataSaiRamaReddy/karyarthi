package com.example.demo.repository;
import com.example.demo.entity.Resume;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
public interface ResumeRepository extends MongoRepository<Resume, String> {
    List<Resume> findByOwnerIdOrderByCreatedAtDesc(String ownerId);
    List<Resume> findAllByOrderByCreatedAtDesc();
    long countByStatus(String status);
    long countByType(String type);

    Iterable<Resume> findByOwnerId(String id);
}