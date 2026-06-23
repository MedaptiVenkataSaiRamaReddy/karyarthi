package com.example.demo.repository;
import com.example.demo.entity.JobDescription;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
public interface JobDescriptionRepository extends MongoRepository<JobDescription, String> {
    List<JobDescription> findByOwnerId(String ownerId);
}