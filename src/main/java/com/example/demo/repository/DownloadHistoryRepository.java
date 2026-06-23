package com.example.demo.repository;
import com.example.demo.entity.DownloadHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface DownloadHistoryRepository extends MongoRepository<DownloadHistory, String> {}