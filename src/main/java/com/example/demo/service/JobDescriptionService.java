package com.example.demo.service;

import com.example.demo.entity.JobDescription;

import java.util.Optional;

public interface JobDescriptionService {
    JobDescription save(JobDescription jd);
    Optional<JobDescription> findById(String id);
}

